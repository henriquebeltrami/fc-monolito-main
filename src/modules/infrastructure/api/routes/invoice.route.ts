import express, { Request, Response } from "express";
import InvoiceRepository from "../../../invoice/repository/invoice.repository";
import { FindInvoiceUseCase } from "../../../invoice/usecase/find/find-invoice.usecase";
import { GenerateInvoiceUseCase } from "../../../invoice/usecase/generate/generate-invoice.usecase";

export const invoiceRoute = express.Router();

invoiceRoute.get("/", async (req: Request, res: Response) => {
    const usecase = new GenerateInvoiceUseCase(new InvoiceRepository());
    try {
        const input = {
            name: req.body.name,
            document: req.body.document,
            street: req.body.street,
            number: req.body.number,
            complement: req.body.complement,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zipCode,
            items: req.body.items.map((item: any) => { return { id: item.id, name: item.name, price: item.price } })
        };
        const output = await usecase.execute(input);
        res.send(output);
    } catch (err) {
        console.error("Error generating invoice:", err);
        res.status(500).send(err);
    }
});

invoiceRoute.get("/:invoiceId", async (req: Request, res: Response) => {
    const usecase = new FindInvoiceUseCase(new InvoiceRepository());
    const output = await usecase.execute({ id: req.params.invoiceId });

    res.format({
        json: async () => res.send(output)
    });
});