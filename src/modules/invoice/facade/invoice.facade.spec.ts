import { Sequelize } from "sequelize-typescript";
import InvoiceModel from "../repository/invoice.model";
import InvoiceItemModel from "../repository/invoice-item.model";
import Address from "../../@shared/domain/value-object/address";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";

describe("Invoice Facade test", () => {

  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([InvoiceModel, InvoiceItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should generate an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input = {
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
        { id: "i1", name: "Item 1", price: 50 },
        { id: "i2", name: "Item 2", price: 75 },
      ],
    };

    const output = await facade.generate(input);

    expect(output).toBeDefined();
    expect(output.id).toBeDefined();
    expect(output.name).toBe(input.name);
    expect(output.document).toBe(input.document);
    expect(output.items.length).toBe(2);
    expect(output.total).toBe(125);
  });

  it("should find an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input = {
      name: "Cliente 2",
      document: "654321",
      address: new Address(
        "Rua Dois",
        "200",
        "Apt 2",
        "Cidade Dois",
        "Estado Dois",
        "54321"
      ),
      items: [
        { id: "i3", name: "Item 3", price: 100 },
        { id: "i4", name: "Item 4", price: 50 },
      ],
    };

    const { id } = await facade.generate(input);

    const output = await facade.find({ id });

    expect(output).toBeDefined();
    expect(output.id).toBe(id);
    expect(output.name).toBe(input.name);
    expect(output.document).toBe(input.document);
    expect(output.items.length).toBe(2);
    expect(output.total).toBe(150);
    expect(output.address.street).toBe(input.address.street);
    expect(output.address.zipCode).toBe(input.address.zipCode);
  });
});