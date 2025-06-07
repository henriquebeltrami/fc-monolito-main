import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import InvoiceFacadeInterface from "../../../invoice/facade/invoice.facade.interface";
import PaymentFacadeInterface from "../../../payment/facade/facade.interface";
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacadeInterface from "../../../store-catalog/facade/store-catalog.facade.interface";
import Client from "../../domain/client.entity";
import Order from "../../domain/order.entity";
import Product from "../../domain/product.entity";
import CheckoutGateway from "../../gateway/checkout.gateway";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";

export default class PlaceOrderUseCase implements UseCaseInterface {
  constructor(
    private clientFacade: ClientAdmFacadeInterface,
    private productFacade: ProductAdmFacadeInterface,
    private catalogFacade: StoreCatalogFacadeInterface,
    private checkoutGateway: CheckoutGateway,
    private invoiceFacade: InvoiceFacadeInterface,
    private paymentFacade: PaymentFacadeInterface
  ) {}

  async execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
    this.validateInput(input);
    await this.validateProducts(input);

    const clientData = await this.clientFacade.find({ id: input.clientId });
    if (!clientData) {
      throw new Error("Client not found");
    }

    const products = await Promise.all(
      input.products.map((p) => this.getProduct(p.productId))
    );

    const address = new Address(
      clientData.address.street,
      clientData.address.number,
      clientData.address.city,
      clientData.address.zipCode,
      clientData.address.state,
      clientData.address.complement
    );

    const client = new Client({
      id: new Id(clientData.id),
      name: clientData.name,
      email: clientData.email,
      document: clientData.document,
      address,
    });

    const order = new Order({ client, products });

    await this.checkoutGateway.addOrder(order);

    const payment = await this.paymentFacade.process({
      orderId: order.id.id,
      amount: order.total,
    });

    const isApproved = payment.status === "approved";

    try {
      const invoice = isApproved
        ? await this.invoiceFacade.generate({
            name: clientData.name,
            document: clientData.document,
            address,
            items: products.map((p) => ({
              id: p.id.id,
              name: p.name,
              price: p.salesPrice,
            })),
          })
        : null;

      if (isApproved) {
        order.approved();
        await this.checkoutGateway.updateOrder(order);
      }

      return {
        id: order.id.id,
        invoiceId: invoice?.id || null,
        status: order.status,
        total: order.total,
        products: order.products.map((p) => ({
          productId: p.id.id,
        })),
      };
    } catch (error) {
      console.error("Erro ao processar pedido:", error);
      throw error;
    }
  }

  private validateInput(input: PlaceOrderInputDto): void {
    if (!input.clientId) {
      throw new Error("Client ID is required");
    }

    if (!input.products || input.products.length === 0) {
      throw new Error("No products selected");
    }

    const productIds = input.products.map((p) => p.productId);
    const duplicates = productIds.filter(
      (id, index) => productIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      throw new Error(`Duplicate product IDs found: ${[...new Set(duplicates)].join(", ")}`);
    }
  }

  private async validateProducts(input: PlaceOrderInputDto): Promise<void> {
    for (const p of input.products) {
      const product = await this.productFacade.checkStock({
        productId: p.productId,
      });
      if (!product || product.stock <= 0) {
        throw new Error(`Product ${p.productId} is not available in stock`);
      }
    }
  }

  private async getProduct(productId: string): Promise<Product> {
    const product = await this.catalogFacade.find({ id: productId });
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    return new Product({
      id: new Id(product.id),
      name: product.name,
      description: product.description,
      salesPrice: product.salesPrice,
    });
  }
}