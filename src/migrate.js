
import Pool from "./3_InfraStructure/database/database.js";
import { readFile } from 'node:fs/promises';


const pool = Pool;
try {
    const sql = await readFile(new URL('../sql/001_init.sql', import.meta.url), 'utf8');
    await pool.query(sql);
    console.log('Migration OK (table roni prête).');
} catch (err) {
    console.error('Migration échouée :', err.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}