import Id from "../../../@shared/domain/value-object/id.value-object";
import Product from "../../domain/product.entity";
import PlaceOrderUseCase from "./place-order.usecase";
import { PlaceOrderInputDto } from "./place-order.dto";
import { up } from "../../../migrations/migration-files/20250605-0001-create-client";

describe("Place Order usecase unit test", () => {
  const client = {
    id: "client-1",
    name: "Test Client",
    document: "000",
    email: "client@test.com",
    address: {
      street: "Street",
      number: "10",
      city: "City",
      state: "State",
      zipCode: "00000",
      complement: "Apt 1",
    },
  };

  const product = new Product({
    id: new Id("p1"),
    name: "Product 1",
    description: "Description",
    salesPrice: 100,
  });

  const createUseCase = ({
    clientFacade = {
      find: jest.fn().mockResolvedValue(client),
      add: jest.fn(),
    },
    productFacade = {
      checkStock: jest.fn().mockResolvedValue({ productId: "p1", stock: 10 }),
      addProduct: jest.fn(),
    },
    catalogFacade = {
      find: jest.fn().mockResolvedValue({
        id: "p1",
        name: "Product 1",
        description: "Description",
        salesPrice: 100,
      }),
      findAll: jest.fn().mockReturnValue(Promise.resolve([product])),
    },
    paymentFacade = {
      process: jest.fn().mockResolvedValue({
        transactionId: "tx1",
        orderId: "o1",
        amount: 100,
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    invoiceFacade = {
      generate: jest.fn().mockResolvedValue({ id: "inv1" }),
      find: jest.fn(),
    },
    checkoutGateway = {
      addOrder: jest.fn(),
      updateOrder: jest.fn(),
      findOrder: jest.fn(),
    },
  } = {}) => {
    return new PlaceOrderUseCase(
      clientFacade,
      productFacade,
      catalogFacade,
      checkoutGateway,
      invoiceFacade,
      paymentFacade
    );
  };

  it("should throw if client is not found", async () => {
    const useCase = createUseCase({
      clientFacade: {
		find: jest.fn().mockResolvedValue(null),
		add: jest.fn()
	},
    });

    const input: PlaceOrderInputDto = {
      clientId: "unknown",
      products: [{ productId: "p1" }],
    };

    await expect(useCase.execute(input)).rejects.toThrow("Client not found");
  });

  it("should throw if no products are provided", async () => {
    const useCase = createUseCase();

    const input: PlaceOrderInputDto = {
      clientId: "client-1",
      products: [],
    };

    await expect(useCase.execute(input)).rejects.toThrow("No products selected");
  });

  it("should throw if a product is out of stock", async () => {
    const useCase = createUseCase({
      productFacade: {
        checkStock: jest.fn().mockResolvedValue({ productId: "p1", stock: 0 }),
      	addProduct: jest.fn(),
      },
    });

    const input: PlaceOrderInputDto = {
      clientId: "client-1",
      products: [{ productId: "p1" }],
    };

    await expect(useCase.execute(input)).rejects.toThrow("Product p1 is not available in stock");
  });

  it("should place an order without approval if payment fails", async () => {
    const useCase = createUseCase({
      paymentFacade: {
        process: jest.fn().mockResolvedValue({
          transactionId: "tx1",
          orderId: "o1",
          amount: 100,
          status: "error",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
      invoiceFacade: {
        generate: jest.fn(),
        find: jest.fn(),
      },
    });

    const input: PlaceOrderInputDto = {
      clientId: "client-1",
      products: [{ productId: "p1" }],
    };

    const result = await useCase.execute(input);

    expect(result.status).toBe("pending");
    expect(result.invoiceId).toBeNull();
    expect(result.total).toBe(100);
  });

  it("should place an order with approved status and invoice", async () => {
    const mockInvoice = { id: "inv1" };
    const invoiceFacade = {
      generate: jest.fn().mockResolvedValue(mockInvoice),
	  find: jest.fn(),
    };

    const useCase = createUseCase({ invoiceFacade });

    const input: PlaceOrderInputDto = {
      clientId: "client-1",
      products: [{ productId: "p1" }],
    };

    const result = await useCase.execute(input);

    expect(result.status).toBe("approved");
    expect(result.invoiceId).toBe("inv1");
    expect(result.total).toBe(100);
    expect(invoiceFacade.generate).toHaveBeenCalled();
  });
});
