import InvoiceFacade from "../facade/invoice.facade";
import InvoiceRepository from "../repository/invoice.repository";
import { GenerateInvoiceUseCase } from "../usecase/generate/generate-invoice.usecase";
import { FindInvoiceUseCase } from "../usecase/find/find-invoice.usecase";

export default class InvoiceFacadeFactory {
  static create(): InvoiceFacade {
    const repository = new InvoiceRepository();
    const generateUsecase = new GenerateInvoiceUseCase(repository);
    const findUsecase = new FindInvoiceUseCase(repository);

    const facade = new InvoiceFacade({
      findUsecase: findUsecase,
      generateUsecase: generateUsecase,
    });

    return facade;
  }
}