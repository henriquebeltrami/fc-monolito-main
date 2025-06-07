import { Sequelize } from "sequelize-typescript";
import OrderModel from "../repository/order.model";
import ProductStoreModel from "../../store-catalog/repository/product.model";
import ProductOrderModel from "../repository/product.order.model";
import ClientAdmFacadeFactory from "../../client-adm/factory/client-adm.facade.factory";
import ProductAdmFacadeFactory from "../../product-adm/factory/facade.factory";
import CheckoutFacadeFactory from "../factory/checkout.facade.factory";
import ClientOrderModel from "../repository/client.order.model";
import TransactionModel from "../../payment/repository/transaction.model";
import StoreCatalogFacadeFactory from "../../store-catalog/factory/facade.factory";
import { ClientModel } from "../../client-adm/repository/client.model";
import InvoiceItemModel from "../../invoice/repository/invoice-item.model";
import InvoiceModel from "../../invoice/repository/invoice.model";
import { ProductModel } from "../../product-adm/repository/product.model";
import Address from "../../@shared/domain/value-object/address";
import { Umzug } from "umzug"
import { migrator } from "../../migrations/config-migrations/migrator";

describe("Checkout Facade Test", () => {

    let sequelize: Sequelize;

    let migration: Umzug<any>;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });

        sequelize.addModels([
            OrderModel,
            ProductOrderModel,
            ClientOrderModel,
            ProductModel,
            ProductStoreModel,
            TransactionModel,
            ClientModel,
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
    });

    it("should add an order", async () => {
        const clientUsecase = ClientAdmFacadeFactory.create();
        const inputClient = {
            id: "1",
            name: "Cliente 1",
            email: "cliente1@email.com",
            document: "123456",
            address: new Address(
                "Rua Um",
                "100",
                "Apt 1",
                "Cidade",
                "Estado",
                "12345"
            ),
        }
        await clientUsecase.add(inputClient);
        const client = await clientUsecase.find({ id: "1" });

        expect(client.id).toBeDefined()
        expect(client.name).toEqual(inputClient.name)
        expect(client.email).toEqual(inputClient.email)
        expect(client.address).toEqual(inputClient.address)

        const productStoreFacade = StoreCatalogFacadeFactory.create();
        const productFacade = ProductAdmFacadeFactory.create();

        const inputProduto1 = {
            id: '1',
            name: 'product 1',
            description: 'product description',
            purchasePrice: 1,
            stock: 10
        };
        productFacade.addProduct(inputProduto1);

        try {
            await ProductStoreModel.update({
                name: inputProduto1.name,
                description: inputProduto1.description,
                salesPrice: inputProduto1.purchasePrice,
            }, {
                where: { id: inputProduto1.id }
            });
        } catch (error) {
            console.error("Error creating products:", error);
        }

        const produto1 = await productStoreFacade.find({ id: inputProduto1.id });

        expect(produto1).toBeDefined();
        expect(produto1.id).toBe(inputProduto1.id);
        expect(produto1.name).toBe(inputProduto1.name);
        expect(produto1.description).toBe(inputProduto1.description);
        expect(produto1.salesPrice).toBe(inputProduto1.purchasePrice);

        const inputProduto2 = {
            id: '2',
            name: 'product 2',
            description: 'product description 2',
            purchasePrice: 2,
            stock: 20
        };
        productFacade.addProduct(inputProduto2);

        try {
            await ProductStoreModel.update({
                name: inputProduto2.name,
                description: inputProduto2.description,
                salesPrice: inputProduto2.purchasePrice,
            }, {
                where: { id: inputProduto2.id }
            });
        } catch (error) {
            console.error("Error creating products:", error);
        }

        const produto2 = await productStoreFacade.find({ id: inputProduto2.id });

        expect(produto2).toBeDefined();
        expect(produto2.id).toBe(inputProduto2.id);
        expect(produto2.name).toBe(inputProduto2.name);
        expect(produto2.description).toBe(inputProduto2.description);
        expect(produto2.salesPrice).toBe(inputProduto2.purchasePrice);

        const listProduct = [
            { productId: produto1.id },
            { productId: produto2.id }
        ];
        expect(listProduct.length).toBe(2);
        expect(listProduct[0].productId).toBe(produto1.id);
        expect(listProduct[1].productId).toBe(produto2.id);

        const facade = CheckoutFacadeFactory.create();
        const output = await facade.placeOrder({ clientId: client.id, products: listProduct });
        expect(output.id).toBeDefined();
        expect(output.invoiceId).toBeDefined();
        expect(output.products.length).toBe(2)
    });

});
