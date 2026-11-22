import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";



describe("Not Found Request ", () => {
    test("Test for not founded Path", async () => {
        const res = await request(app).get("/path_not_configred");
        expect(res.status).toBe(404);
    });

});
