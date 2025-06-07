import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: "client_order",
    timestamps: false,
})
export default class ClientOrderModel extends Model{

    @PrimaryKey
    @Column({allowNull: false})
    declare id: string;
    
    @Column({allowNull: false})
    declare name: string;
    
    @Column({allowNull: false})
    declare email: string;
    
    @Column({allowNull: false})
    declare document: string;
}