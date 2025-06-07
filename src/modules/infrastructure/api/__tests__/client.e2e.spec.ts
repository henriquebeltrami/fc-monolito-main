import { Sequelize } from "sequelize-typescript";
import { Umzug } from "umzug";
import { migrator } from "../../../migrations/config-migrations/migrator";
import { app } from "../express";
import request from "supertest";
import { ClientModel } from "../../../client-adm/repository/client.model";

describe("E2E test for client", () => {

    let sequelize: Sequelize;

    let migration: Umzug<any>;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        sequelize.addModels([ClientModel]);
        migration = migrator(sequelize)
        await migration.up()
    });

    afterEach(async () => {
        if (!migration || !sequelize) {
            return
        }
        migration = migrator(sequelize)
        await migration.down()
        await sequelize.close()
    })

    it("should create a client", async () => {
        const response = await request(app)
            .post("/clients")
            .send({
                "name": "Cliente 1",
                "email": "email@email.com",
                "document": "123456",
                "address": {
                    "street": "Rua Um",
                    "number": "123",
                    "complement": "Apt 1",
                    "city": "Cidade",
                    "state": "Estado",
                    "zipCode": "987654",
                }
            });
        expect(response.status).toBe(200);
        expect(response.body.name).toBe("Cliente 1");
        expect(response.body.email).toBe("email@email.com");
        expect(response.body.document).toBe("123456");
        expect(response.body.address._street).toBe("Rua Um");
        expect(response.body.address._number).toBe("123");
        expect(response.body.address._complement).toBe("Apt 1");
        expect(response.body.address._city).toBe("Cidade");
        expect(response.body.address._zipCode).toBe("987654");
        expect(response.body.address._state).toBe("Estado");
    });
});