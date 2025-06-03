import { GenerateInvoiceUseCase } from "./generate-invoice.usecase";

const mockRepository = () => {
  return {
    find: jest.fn(),
    generate: jest.fn(),
  };
};

describe("Generate Invoice usecase unit test", () => {
  it("should generate an invoice", async () => {
    const repository = mockRepository();
    const generateUseCase = new GenerateInvoiceUseCase(repository);

    const input = {
      name: 'Cliente 1',
      document: '123456',
      street: 'Rua Um',
      number: '100',
      complement: 'Apt 1',
      city: 'Cidade',
      state: 'Estado',
      zipCode: '12345',
      items: [
        { id: 'i1', name: 'Item 1', price: 50 },
        { id: 'i2', name: 'Item 2', price: 75 },
      ],
    };

    const output = await generateUseCase.execute(input);

    expect(output).toHaveProperty("id");
    expect(output.name).toBe(input.name);
    expect(output.document).toBe(input.document);
    expect(output.items.length).toBe(2);
    expect(output.total).toBe(125);
  });
});