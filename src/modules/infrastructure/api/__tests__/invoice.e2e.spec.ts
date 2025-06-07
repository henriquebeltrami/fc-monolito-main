import { Sequelize } from "sequelize-typescript";
import { app } from "../express";
import request from "supertest";
import { Umzug } from "umzug";
import { migrator } from "../../../migrations/config-migrations/migrator";
import { ProductModel } from "../../../product-adm/repository/product.model";
import { ClientModel } from "../../../client-adm/repository/client.model";
import ProductStoreModel from "../../../store-catalog/repository/product.model";
import OrderModel from "../../../checkout/repository/order.model";
import ClientOrderModel from "../../../checkout/repository/client.order.model";
import ProductOrderModel from "../../../checkout/repository/product.order.model";
import TransactionModel from "../../../payment/repository/transaction.model";
import InvoiceItemModel from "../../../invoice/repository/invoice-item.model";
import InvoiceModel from "../../../invoice/repository/invoice.model";

describe('E2E test for invoice', () => {

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

  it('should find an invoice', async () => {
    const client = await request(app)
      .post('/clients')
      .send({
        "name": "jose",
        "email": "email@email",
        "document": "123",
        "address": {
          "street": "street",
          "number": "123",
          "city": "city",
          "zipCode": "zipCode",
          "state": "state",
          "complement": "complement"
        }
      });
    const product = await request(app)
      .post('/products')
      .send({
        "name": "product",
        "description": "description",
        "purchasePrice": 100,
        "stock": 10
      });

    try {
      await ProductStoreModel.update({
        name: product.body.name,
        description: product.body.description,
        salesPrice: product.body.purchasePrice,
      }, {
        where: { id: product.body.id }
      });
    } catch (error) {
      console.error("Error creating products:", error);
    }

    const checkout = await request(app)
      .post('/checkout')
      .send({
        "clientId": client.body.id,
        "products": [
          {
            "productId": product.body.id
          }
        ]
      });

    const response = await request(app)
      .get(`/invoice/${checkout.body.invoiceId}`)
      .send();
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(client.body.name);
    expect(response.body.items.length).toBe(1)
    expect(response.body.total).toBe(product.body.purchasePrice);
  });

});