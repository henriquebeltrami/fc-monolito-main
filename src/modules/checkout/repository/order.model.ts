import {Table, Model, PrimaryKey, Column, HasMany, ForeignKey, BelongsTo } from "sequelize-typescript";
import ClientOrderModel from "./client.order.model";
import ProductOrderModel from "./product.order.model";

@Table({
    tableName: "order",
    timestamps: false
})
export default class OrderModel extends Model{

    @PrimaryKey
    @Column({allowNull: false})
    declare id: string;

    @ForeignKey(() => ClientOrderModel)
    declare client_id: string;

    @BelongsTo(() => ClientOrderModel)
    declare client: ClientOrderModel;

    @HasMany(() => ProductOrderModel, {onUpdate: "CASCADE"})
    declare products?: ProductOrderModel[];
}