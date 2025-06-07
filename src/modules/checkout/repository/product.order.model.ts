import { Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import OrderModel from "./order.model";
import InvoiceModel from "../../invoice/repository/invoice.model";

@Table({
    tableName: "products_order",
    timestamps: false
})
export default class ProductOrderModel extends Model{

    @PrimaryKey
    @Column({allowNull: false})
    declare id: string;

    @Column({allowNull: false})
    declare name: string;

    @Column({allowNull: true})
    declare description: string;

    @Column({allowNull: true})
    declare purchasePrice: number;

    @Column({allowNull: true})
    declare salesPrice: number;

    @Column({allowNull: true})
    declare stock: number;

    @Column({allowNull: true})
    declare createAt: Date;

    @Column({allowNull: true})
    declare updateAt: Date;

    @ForeignKey(() => InvoiceModel)
    declare invoice_id: string;

    @ForeignKey(() => OrderModel)
    declare order_id: string;

}