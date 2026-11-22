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
MJJ  1950 -0.75
MJJ  1950 -0.75
MJJ  1950 -0.75
MJJ  1950 -0.75
ASO  1952  0.08
SON  1952  0.04
OND  1952 -0.10
NDJ  1952  0.10
DJF  1953  0.40
JFM  1953  0.67
FMA  1953  0.68
MAM  1953  0.72
AMJ  1953  0.9
OND  1953  0.57
NDJ  1953  0.66
`;



describe("Parse Data => Les Doublons ", () => {
    test("6x(JFM-1950) + 4x(MJJ-1950) | Total = (6-1) + (4-1) = 8) ", async () => {
        const { rows, duplicatesInFile } = parseRoni(TestData);
        expect(duplicatesInFile).toBe(8);
    });
    test("25 - 8 = 17 Rows Returned to be 17 (duplicated Data = 8, rows = 25 ) ) ", async () => {
        const { rows, duplicatesInFile } = parseRoni(TestData);
        expect(rows.length).toBe(17);
    });

});
