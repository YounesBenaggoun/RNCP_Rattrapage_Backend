/**
 * Insère/met à jour les lignes RONI en une seule transaction.
 *
 * Contrôle des doublons : la contrainte UNIQUE (season, year) en base + ON CONFLICT.
 *  - ligne absente        -> insérée
 *  - ligne présente, anom différente (NOAA a révisé la valeur) -> mise à jour
 *  - ligne présente, identique -> ignorée (aucune écriture)
 *
 * @param {import('pg').Pool} pool
 * @param {Array<{season: string, year: number, centerMonth: number, anom: number}>} rows
 */
export async function upsertRoni(pool, rows) {
  if (rows.length === 0) return { inserted: 0, updated: 0, unchanged: 0 };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: result } = await client.query(
      `INSERT INTO roni (season, year, center_month, anom)
       SELECT * FROM unnest($1::char(3)[], $2::smallint[], $3::smallint[], $4::numeric[])
       ON CONFLICT (season, year) DO UPDATE
         SET anom = EXCLUDED.anom, updated_at = now()
         WHERE roni.anom IS DISTINCT FROM EXCLUDED.anom
       RETURNING (xmax = 0) AS inserted`,
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