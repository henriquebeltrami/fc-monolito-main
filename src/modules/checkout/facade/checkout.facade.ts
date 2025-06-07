import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import CheckoutFacadeInterface, { CheckoutFacadeInputDto, CheckoutFacadeOutputDto } from "./checkout.facade.interface";

export interface UseCaseProps {
  placeOrderUsecase: UseCaseInterface;
}

export default class CheckoutFacade implements CheckoutFacadeInterface {
    
  private _placeOrderUsecase: UseCaseInterface;

  constructor(usecaseProps: UseCaseProps){
      this._placeOrderUsecase = usecaseProps.placeOrderUsecase;
  }

  placeOrder(input: CheckoutFacadeInputDto): Promise<CheckoutFacadeOutputDto> {
      return this._placeOrderUsecase.execute(input);
  }
}