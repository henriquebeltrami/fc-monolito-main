import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "../domain/client.entity";
import Order from "../domain/order.entity";
import CheckoutGateway from "../gateway/checkout.gateway";
import ClientOrderModel from "./client.order.model";
import OrderModel from "./order.model";
import ProductOrderModel from "./product.order.model";

export default class OrderRepository implements CheckoutGateway {

    async addOrder(order: Order): Promise<Order> {

        const products = order.products.map((p) => {
            return {
                id: p.id.id,
                name: p.name,
                salesPrice: p.salesPrice,
            }
        })
        try {
            await OrderModel.create({
                id: order.id.id,
                client: {
                    id: order.client.id.id,
                    name: order.client.name,
                    document: order.client.document,
                    email: order.client.email
                },
                products: products
            },
                {
                    include: [ClientOrderModel, ProductOrderModel]
                });
        } catch (error) {
            throw error
        }

        const result = await OrderModel.findOne(
            { where: { id: order.id.id }, include: [{ model: ClientOrderModel }, { model: ProductOrderModel }] });
        const orderBD = result.dataValues
        const clientBD = orderBD.client.dataValues;
        const productsBD = orderBD.products
        const productsRes = productsBD.map((p: { id: string; name: any; salesPrice: any; }) => {
            return {
                id: new Id(p.id),
                name: p.name,
                salesPrice: p.salesPrice
            }
        })
        const client = new Client({
            id: new Id(clientBD.id),
            name: clientBD.name,
            document: clientBD.document,
            email: clientBD.email
        })
        return new Order({
            id: new Id(orderBD.id),
            client: client,
            products: productsRes
        })
    }

    async updateOrder(order: Order): Promise<Order> {
        await ClientOrderModel.update(
            {
                name: order.client.name,
                document: order.client.document,
                email: order.client.email
            },
            { where: { id: order.client.id.id } }
        );

        for (const p of order.products) {
            await ProductOrderModel.update(
                {
                    name: p.name,
                    salesPrice: p.salesPrice
                },
                { where: { id: p.id.id } }
            );
        }

        await OrderModel.update(
            {
                client_id: order.client.id.id
            },
            { where: { id: order.id.id } }
        );

        return this.findOrder(order.id.id);
    }

    async findOrder(id: string): Promise<Order> {
        const result = await OrderModel.findOne(
            { where: { id: id }, include: ["client", "products"] });
        const orderBD = result.dataValues
        const clientBD = orderBD.client.dataValues;
        const productsBD = orderBD.products
        const productsRes = productsBD.map((p: { id: string; name: any; salesPrice: any; }) => {
            return {
                id: new Id(p.id),
                name: p.name,
                salesPrice: p.salesPrice
            }
        })
        const client = new Client({
            id: new Id(clientBD.id),
            name: clientBD.name,
            document: clientBD.document,
            email: clientBD.email
        })
        return new Order({
            id: new Id(orderBD.id),
            client: client,
            products: productsRes
        })
    }

}