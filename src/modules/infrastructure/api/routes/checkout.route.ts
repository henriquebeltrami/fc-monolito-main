import express, { Request, Response } from "express";
import CheckoutFacadeFactory from "../../../checkout/factory/checkout.facade.factory";

export const checkoutRoute = express.Router();

checkoutRoute.post("/", async (req: Request, res: Response) => {
  try {
    const input = {
        clientId: req.body.clientId,
        products: req.body.products.map((p: { productId: any; }) => { return {productId: p.productId}}
    )};
    const facade = CheckoutFacadeFactory.create();
    const output = await facade.placeOrder(input);

    res.send(output);
  } catch (err) {
    console.error("Error processing checkout:", err);
    res.status(500).send(err);
  }
});