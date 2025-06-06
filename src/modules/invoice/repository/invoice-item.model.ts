import {
  Column,
  Model,
  PrimaryKey,
  Table,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import InvoiceModel from "./invoice.model";

@Table({
  tableName: "invoice_item",
  timestamps: false,
})
export default class InvoiceItemModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @ForeignKey(() => InvoiceModel)
  @Column({ allowNull: false })
  invoiceId: string;

  @BelongsTo(() => InvoiceModel)
  invoice: InvoiceModel;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  price: number;
}
