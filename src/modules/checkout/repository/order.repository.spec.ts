
import Order from "../domain/order.entity"
import Product from "../domain/product.entity"
import ProductOrderModel from "./product.order.model"
import TransactionModel from "../../payment/repository/transaction.model"
import { Sequelize } from "sequelize-typescript"
import Id from "../../@shared/domain/value-object/id.value-object"
import ClientOrderModel from "./client.order.model"
import OrderModel from "./order.model"
import OrderRepository from "./order.repository"
import Client from "../domain/client.entity"
import Address from "../../@shared/domain/value-object/address"

describe("Order Repository test", () => {

    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
            sync: { force: true }
        });
        sequelize.addModels([OrderModel, ClientOrderModel, ProductOrderModel, TransactionModel]);
        await sequelize.sync();
    })

    afterEach(async () => {
        await sequelize.close();
    })

    it("should create an order", async () => {
        const client = new Client({
            id: new Id("c1"),
            name: "Cliente 1",
            address: new Address(
                "Rua Um",
                "100",
                "Apt 1",
                "Cidade Um",
                "Estado",
                "12345-678"
            ),
            email: "email@email.com",
            document: "123456",
        })
        const product = new Product({ id: new Id("p1"), name: "Item 01", description: "Descrição Item 01", salesPrice: 10 })
        const product1 = new Product({ id: new Id("p2"), name: "Item 02", description: "Descrição Item 01", salesPrice: 15 })
        const products = [product, product1]

        const order = new Order({
            id: new Id("1"),
            status: "approved",
            client: client,
            products: products
        });
        
        const orderRepository = new OrderRepository();
        const output = await orderRepository.addOrder(order);
        expect(output.id.id).toBe("1")
        expect(output.client.id.id).toBe("c1")
        expect(output.client.name).toBe("Cliente 1")
        expect(output.client.document).toBe("123456")
        expect(output.client.address).toBeUndefined()
        expect(output.products.length).toBe(2)
        expect(output.products[0].id.id).toBe("p1")
        expect(output.products[1].id.id).toBe("p2")
    });

    it("should find an order", async () => {
        const client = new Client({
            id: new Id("c1"),
            name: "Cliente 1",
            address: new Address(
                "Rua Um",
                "100",
                "Apt 1",
                "Cidade Um",
                "Estado",
                "12345-678"
            ),
            email: "email@email.com",
            document: "123456",
        })
        const product = new Product({ id: new Id("p1"), name: "Item 01", description: "Descrição Item 01", salesPrice: 10 })
        const product1 = new Product({ id: new Id("p2"), name: "Item 02", description: "Descrição Item 01", salesPrice: 15 })
        const products = [product, product1]

        const order = new Order({
            id: new Id("1"),
            status: "approved",
            client: client,
            products: products
        });

        const orderRepository = new OrderRepository();
        await orderRepository.addOrder(order);
        const output = await orderRepository.findOrder("1")
        expect(output.id.id).toBe("1")
        expect(output.client.id.id).toBe("c1")
        expect(output.client.name).toBe("Cliente 1")
        expect(output.client.document).toBe("123456")
        expect(output.client.address).toBeUndefined()
        expect(output.products.length).toBe(2)
        expect(output.products[0].id.id).toBe("p1")
        expect(output.products[1].id.id).toBe("p2")
    })
})