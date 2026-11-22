/**
 * Insère/met à jour les lignes RONI en une seule transaction.
 *
 * Contrôle des doublons : la contrainte UNIQUE (season, year) en base + ON CONFLICT.
 *  - ligne absente        -> insérée
 *  - ligne présente, anom différente (NOAA a révisé la valeur) -> mise à jour
 *  - ligne présente, identique -> ignorée (aucune écriture)
 */
export async function upsertRoni(pool, rows) {
  if (rows.length === 0) return { inserted: 0, updated: 0, unchanged: 0 };

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log(rows);
    const { rows: result } = await client.query(
      `INSERT INTO roni (season, year, center_month, anom) VALUES ($1, $2, $3, $4)`,
      [
        rows.map((r) => r.season),
        rows.map((r) => r.year),
        rows.map((r) => r.centerMonth),
        rows.map((r) => r.anom),
      ],
    );

    await client.query('COMMIT');

    const inserted = result.filter((r) => r.inserted).length;
    const updated = result.length - inserted;
    return { inserted, updated, unchanged: rows.length - result.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
