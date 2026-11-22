
import Pool from "./3_InfraStructure/database/database.js";

import { fetchRoniText } from './fetcher.js';
import { validateFileHeader, validateRowCount } from './validation.js';
import { parseRoni } from './parser.js';
import { upsertRoni } from './repository.js';



const pool = Pool;

const RoniURL = "https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt";



try {
    console.log(`Téléchargement : ${RoniURL}`);
    const text = await fetchRoniText(RoniURL);
    validateFileHeader(text);
    const { rows, duplicatesInFile } = parseRoni(text);

    validateRowCount(rows.length);
    console.log(`${rows.length} lignes lues (${duplicatesInFile} doublon(s) dans le fichier).`);
    const stats = await upsertRoni(pool, rows);
    // console.log(
    //     `Terminé : ${stats.inserted} insérées, ${stats.updated} mises à jour, ${stats.unchanged} inchangées.`,
    // );
} catch (err) {
    console.error('Import échoué :', err.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}

