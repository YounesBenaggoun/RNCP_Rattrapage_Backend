import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { parseRoni } from "../../importData/parser.js";



const TestData = `
SEAS   YR  ANOM
DJF  1950 -1.19
JFM  1950 -1.08
JFM  1950 -1.08
JFM  1950 -1.08
JFM  1950 -1.08
JFM  1950 -1.08
JFM  1950 -1.08
FMA  1950 -0.96
MAM  1950 -1.00
AMJ  1950 -0.99
`;



describe("Parse Data => Les Doublons ", () => {
    test("6x(JFM 1950) Duplicated Data = 5", async () => {
        const { rows, duplicatesInFile } = parseRoni(TestData);
        expect(duplicatesInFile).toBe(5);
    });
    test("10 - 5(duplicated) = 5 Rows Returned) ", async () => {
        const { rows, duplicatesInFile } = parseRoni(TestData);
        expect(rows.length).toBe(5);
    });

});
