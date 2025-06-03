import { Sequelize } from "sequelize-typescript"
import InvoiceRepository from "./invoice.repository"
import InvoiceModel from "./invoice.model"
import InvoiceItemModel from "./invoice-item.model"
import Id from "../../@shared/domain/value-object/id.value-object"
import Address from "../../@shared/domain/value-object/address"
import Invoice from "../domain/invoice.entity"
import InvoiceItem from "../domain/invoice-item.entity"

describe("Invoice Repository test", () => {

  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true }
    })

    sequelize.addModels([InvoiceModel, InvoiceItemModel])
    await sequelize.sync()
  })

  afterEach(async () => {
    await sequelize.close()
  })

  it("should create an invoice", async () => {

    const invoice = new Invoice({
      id: new Id("1"),
      name: "Cliente 1",
      document: "123456",
      address: new Address(
        "Rua Um",
        "100",
        "Apt 1",
        "Cidade Um",
        "Estado",
        "12345-678"
      ),
      items: [
        new InvoiceItem({
          id: new Id("i1"),
          name: "Item 01",
          price: 50
        }),
        new InvoiceItem({
          id: new Id("i2"),
          name: "Item 02",
          price: 150
        })
      ]
    })

    const repository = new InvoiceRepository()
    await repository.generate(invoice)

    const invoiceDb = await InvoiceModel.findOne({
      where: { id: "1" },
      include: ["items"]
    })

    expect(invoiceDb).toBeDefined()
    expect(invoiceDb.id).toBe(invoice.id.id)
    expect(invoiceDb.name).toBe(invoice.name)
    expect(invoiceDb.document).toBe(invoice.document)
    expect(invoiceDb.street).toBe(invoice.address.street)
    expect(invoiceDb.number).toBe(invoice.address.number)
    expect(invoiceDb.complement).toBe(invoice.address.complement)
    expect(invoiceDb.city).toBe(invoice.address.city)
    expect(invoiceDb.state).toBe(invoice.address.state)
    expect(invoiceDb.zipcode).toBe(invoice.address.zipCode)
    expect(invoiceDb.items.length).toBe(2)
    expect(invoiceDb.items[0].id).toBe(invoice.items[0].id.id)
    expect(invoiceDb.items[0].name).toBe(invoice.items[0].name)
    expect(invoiceDb.items[0].price).toBe(invoice.items[0].price)
    expect(invoiceDb.items[1].id).toBe(invoice.items[1].id.id)
    expect(invoiceDb.items[1].name).toBe(invoice.items[1].name)
    expect(invoiceDb.items[1].price).toBe(invoice.items[1].price)
    expect(invoiceDb.createdAt).toStrictEqual(invoice.createdAt)
    expect(invoiceDb.updatedAt).toStrictEqual(invoice.updatedAt)
  })

  it("should find an invoice", async () => {

    await InvoiceModel.create(
      {
        id: "1",
        name: "Cliente 1",
        document: "123456",
        street: "Rua Um",
        number: "100",
        complement: "Apt 1",
        city: "Cidade Um",
        state: "Estado",
        zipcode: "12345-678",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "i1",
            name: "Item 01",
            price: 50
          },
          {
            id: "i2",
            name: "Item 02",
            price: 150
          }
        ]
      },
      {
        include: [{ model: InvoiceItemModel }]
      }
    )

    const repository = new InvoiceRepository()
    const invoice = await repository.find("1")

    expect(invoice.id.id).toBe("1")
    expect(invoice.name).toBe("Cliente 1")
    expect(invoice.document).toBe("123456")
    expect(invoice.address.street).toBe("Rua Um")
    expect(invoice.address.number).toBe("100")
    expect(invoice.address.complement).toBe("Apt 1")
    expect(invoice.address.city).toBe("Cidade Um")
    expect(invoice.address.state).toBe("Estado")
    expect(invoice.address.zipCode).toBe("12345-678")
    expect(invoice.items.length).toBe(2)
    expect(invoice.items[0].id.id).toBe("i1")
    expect(invoice.items[0].name).toBe("Item 01")
    expect(invoice.items[0].price).toBe(50)
    expect(invoice.items[1].id.id).toBe("i2")
    expect(invoice.items[1].name).toBe("Item 02")
    expect(invoice.items[1].price).toBe(150)
    expect(invoice.createdAt).toBeDefined()
    expect(invoice.updatedAt).toBeDefined()
  })
})
