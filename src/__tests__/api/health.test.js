import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";




describe("Health  Request ", () => {
    test("Status 200 for Health Path", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({ status: 'ok' })
        );
    });

});
