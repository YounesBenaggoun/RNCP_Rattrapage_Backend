import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";




describe("Find By Range ", () => {
    test("Result length toBe 6 (6 months) ", async () => {
        const res = await request(app)
            .get("/oni/range")
            .query({ startDate: "1995-05-01", endDate: "1995-10-01" });


        expect(res.status).toBe(200);
        expect(res.body.length).toBe(6);
    });

    test("Resultat = 12 ligne (12 mois) ", async () => {
        const res = await request(app)
            .get("/oni/range")
            .query({ startDate: "2000-01-01", endDate: "2000-12-01" });
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(12);
    });

    test("Reponse si Le début et supereur à la endDate", async () => {
        const res = await request(app)
            .get("/oni/range")
            .query({ startDate: "2001-01-01", endDate: "2000-12-01" });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe("endDate doit être postérieure ou égale à startDate");
    });

    test("Test Si StartDate est invalide", async () => {
        const res = await request(app)
            .get("/oni/range")
            .query({ endDate: "2000-12-01" });
        expect(res.status).toBe(500);
    });

    test("Test Si EndDate est invalide", async () => {
        const res = await request(app)
            .get("/oni/range")
            .query({ startDate: "2000-12-01" });
        expect(res.status).toBe(500);
    });

    test("Test Si Mauvais Format de la Date", async () => {
        const res = await request(app)
            .get("/oni/range")
            .query({ startDate: "2001-15-48", endDate: "2000-12-01" });
        expect(res.status).toBe(500);
    });


    test("Test Si endDate = 3000 ", async () => {
        const res = await request(app)
            .get("/oni/range")
            .query({ startDate: "2000-01-01", endDate: "3000-12-01" });
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(1);
    });

});
