import { FindInvoiceUseCase } from "./find-invoice.usecase";
import Address from "../../../@shared/domain/value-object/address";
import Invoice from "../../domain/invoice.entity";
import InvoiceItem from "../../domain/invoice-item.entity";

const mockRepository = () => {
  return {
    find: jest.fn().mockResolvedValue(invoice),
    generate: jest.fn(),
  };
};

const invoice = new Invoice({
  name: "Cliente 1",
  document: "123456",
  address: new Address(
    "Rua Um",
    "100",
    "Apt 1",
    "Cidade",
    "Estado",
    "12345"
  ),
  items: [
    new InvoiceItem({ name: "Item 1", price: 50 }),
    new InvoiceItem({ name: "Item 2", price: 75 }),
  ],
});

describe("Find Invoice usecase unit test", () => {
  it("should find an invoice", async () => {
    const repository = mockRepository();
    const useCase = new FindInvoiceUseCase(repository);

    const result = await useCase.execute({ id: invoice.id.id });

    expect(result.id).toBe(invoice.id.id);
    expect(result.name).toBe(invoice.name);
    expect(result.document).toBe(invoice.document);
    expect(result.items.length).toBe(2);
    expect(result.total).toBe(125);
    expect(result.address.street).toBe("Rua Um");
  });
});