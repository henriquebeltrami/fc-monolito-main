import InvoiceGateway from '../../gateway/invoice.gateway';
import Invoice from '../../domain/invoice.entity';
import InvoiceItem from '../../domain/invoice-item.entity';
import { GenerateInvoiceUseCaseInputDto, GenerateInvoiceUseCaseOutputDto } from './generate-invoice.dto';
import Address from '../../../@shared/domain/value-object/address';

export class GenerateInvoiceUseCase {
  private invoiceRepository: InvoiceGateway;

  constructor(invoiceRepository: InvoiceGateway) {
    this.invoiceRepository = invoiceRepository;
  }

  async execute(input: GenerateInvoiceUseCaseInputDto): Promise<GenerateInvoiceUseCaseOutputDto> {
    const address = new Address(
      input.street,
      input.number,
      input.complement,
      input.city,
      input.state,
      input.zipCode,
    );
    const items = input.items.map(item => new InvoiceItem({ id: undefined, name: item.name, price: item.price }));
    const invoice = new Invoice({
      name: input.name,
      document: input.document,
      address,
      items,
    });
    await this.invoiceRepository.generate(invoice);
    const output: GenerateInvoiceUseCaseOutputDto = {
      id: invoice.id.id,
      name: invoice.name,
      document: invoice.document,
      street: invoice.address.street,
      number: invoice.address.number,
      complement: invoice.address.complement,
      city: invoice.address.city,
      state: invoice.address.state,
      zipCode: invoice.address.zipCode,
      items: invoice.items.map(i => ({
        id: i.id.id,
        name: i.name,
        price: i.price,
      })),
      total: invoice.total,
    };
    return output;
  }
}
