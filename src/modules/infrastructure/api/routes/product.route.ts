import express, { Request, Response } from "express";
import ProductRepository from "../../../product-adm/repository/product.repository";
import AddProductUseCase from "../../../product-adm/usecase/add-product/add-product.usecase";

export const productRoute = express.Router();

productRoute.post("/", async (req: Request, res: Response) => {
    const usecase = new AddProductUseCase(new ProductRepository());
    try {
        const input = {
            name: req.body.name,
            description: req.body.description,
            purchasePrice: req.body.purchasePrice,
            stock: req.body.stock
        };
        const output = await usecase.execute(input);
        res.send(output);
    } catch (err) {
        res.status(500).send(err);
    }
});