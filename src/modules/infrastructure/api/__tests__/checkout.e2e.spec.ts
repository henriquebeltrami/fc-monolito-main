import { Sequelize } from "sequelize-typescript";
import { app } from "../express";
import request from "supertest";
import ProductStoreModel from "../../../store-catalog/repository/product.model";
import { Umzug } from "umzug"
import { migrator } from "../../../migrations/config-migrations/migrator";
import { ProductModel } from "../../../product-adm/repository/product.model";
import ClientOrderModel from "../../../checkout/repository/client.order.model";
import OrderModel from "../../../checkout/repository/order.model";
import ProductOrderModel from "../../../checkout/repository/product.order.model";
import { ClientModel } from "../../../client-adm/repository/client.model";
import InvoiceItemModel from "../../../invoice/repository/invoice-item.model";
import InvoiceModel from "../../../invoice/repository/invoice.model";
import TransactionModel from "../../../payment/repository/transaction.model";

describe("E2E test for checkout", () => {

  let sequelize: Sequelize;

  let migration: Umzug<any>;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });

    sequelize.addModels([
      ProductModel,
      ProductStoreModel,
      ClientModel,
      OrderModel,
      ProductOrderModel,
      ClientOrderModel,
      TransactionModel,
      InvoiceItemModel,
      InvoiceModel
    ]);
    migration = migrator(sequelize)
    await migration.up()
  });

  afterEach(async () => {
    if (!migration || !sequelize) {
      return
    }
    migration = migrator(sequelize)
    await migration.down()
    await sequelize.close()
  })

  it("should create a checkout", async () => {
    const client = await request(app).post("/clients").send({
      id: "1",
      name: "Client1",
      email: "email@email.com",
      document: "123456",
      address: {
        street: "Rua Um",
        number: "123",
        complement: "Apt 1",
        city: "Cidade",
        state: "Estado",
        zipCode: "987654",
      }
    });

    const product1 = await request(app).post("/products").send({
      id: "1",
      name: "Product1",
      description: "Description1",
      purchasePrice: 100,
      stock: 100,
    });

    const product2 = await request(app).post("/products").send({
      id: "2",
      name: "Product2",
      description: "Description2",
      purchasePrice: 200,
      stock: 200,
    });

    try {
      await ProductStoreModel.update({
        name: product1.body.name,
        description: product1.body.description,
        salesPrice: product1.body.purchasePrice,
      }, {
        where: { id: product1.body.id }
      });
    } catch (error) {
      console.error("Error creating products:", error);
    }

    try {
      await ProductStoreModel.update({
        name: product2.body.name,
        description: product2.body.description,
        salesPrice: product2.body.purchasePrice,
      }, {
        where: { id: product2.body.id }
      });
    } catch (error) {
      console.error("Error creating products:", error);
    }

    const checkout = await request(app)
      .post("/checkout")
      .send({
        clientId: client.body.id,
        products: [
          {
            productId: product1.body.id,
          },
          {
            productId: product2.body.id,
          },
        ],
      });

    expect(checkout.status).toBe(200);
    expect(checkout.body.products.length).toBe(2);
    expect(checkout.body.total).toBe(product1.body.purchasePrice + product2.body.purchasePrice);
    expect(checkout.body.invoiceId).toBeDefined();
    expect(checkout.body.status).toBe("approved");
  });
});
