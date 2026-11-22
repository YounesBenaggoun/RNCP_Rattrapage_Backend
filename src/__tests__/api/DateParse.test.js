import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { parseRoni } from "../../importData/parser.js";
import { validateRow } from "../../importData/validation.js";



const correctObj = {
    season: "DJF",
    year: 1950,
    anom: 0.5
}
const problemSeasonObj = {
    season: "DJ",
    year: 1950,
    anom: 0.5
}
const problemYearObj = {
    season: "DJF",
    year: 190,
    anom: 0.5
}
const problemAnomObj = {
    season: "DJF",
    year: 1950,
    anom: 10
}






describe("Date Parse => ", () => {
    test("Validate Row Correct", async () => {
        const correctResult = validateRow(correctObj);
        expect(correctResult).toBeTruthy();
    });
    test("Throw Error Saison Inconnue", async () => {
        expect(() => validateRow(problemSeasonObj)).toThrow(
            /Saison inconnue/
        );
    });

    test("Throw Error For Year Problem", async () => {
        expect(() => validateRow(problemYearObj)).toThrow(
            /Année hors limites 1950-2027/
        );
    });

    test("Throw Error For Anomaly Problem", async () => {
        expect(() => validateRow(problemAnomObj)).toThrow(
            /Anomalie hors limites/
        );
    });
});
