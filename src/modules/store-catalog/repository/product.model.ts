import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  modelName: 'product-catalog-table',
  tableName: "products",
  timestamps: true,
})
export default class ProductStoreModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  description: string;

  @Column({ allowNull: false })
  salesPrice: number;
}
