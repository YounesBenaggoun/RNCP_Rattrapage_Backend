
import { OniObservation } from "../../1_Domain/entities/OniObservation.js";
import IOniObersrvation from "../../1_Domain/interface/OniObservation.interface.js";


export default class PostgresOniRepository extends IOniObersrvation {
    constructor({ pool }) {
        super();
        this.pool = pool;
    }

    async getByRange(startDate, endDate) {
        const toDay = (value, label) => {
            const d = value instanceof Date ? value : new Date(value);
            if (Number.isNaN(d.getTime())) {
                throw new TypeError(`${label} invalide : "${value}"`);
            }
            return d.toISOString().slice(0, 10); // YYYY-MM-DD
        };

        const start = toDay(startDate, "startDate");
        const end = toDay(endDate, "endDate");
        console.log(start);
        if (end < start) {
            throw new RangeError("endDate doit être postérieure ou égale à startDate");
        }

        const tab = await this.pool.query(
            `SELECT year, anom AS oni, month
             FROM public.roni
             WHERE center_month BETWEEN $1::date AND $2::date
             ORDER BY year ASC, month ASC`,
            [start, end]
        );

        return tab.rows;
    }

    async getAll() {
        const tab = await this.pool.query(
            `SELECT year , anom as oni , month
     FROM public.roni
     ORDER BY year ASC, month ASC`
        );
        const result = tab.rows;
        return result;
    }


    async findDuplicatedData() {
        const tab = await this.pool.query(
            `SELECT
                year,
                month,
            COUNT(*) AS occurrences
            FROM public.roni
            GROUP BY year, month
            HAVING COUNT(*) > 1
            ORDER BY year ASC, month ASC`
        );
        const result = tab.rows.length;
        return `There are ${result} duplicated Data`;
    }
    async stats() {
        const { rows } = await this.pool.query(`
      SELECT
        COUNT(*)::int                                                  AS total,
        COUNT(*) FILTER (WHERE anom >= 0.5)::int                    AS el_nino,
        COUNT(*) FILTER (WHERE anom <= -0.5)::int                   AS la_nina,
        COUNT(*) FILTER (WHERE anom > -0.5 AND anom < 0.5)::int  AS neutral,
        MIN(center_month)                                               AS first_date,
        MAX(center_month)                                               AS last_date,
        AVG(anom)::numeric(6,3)                                     AS avg_anomaly
      FROM roni
    `);
        return rows[0];
    }
    async findLatest() {
        const { rows } = await this.pool.query(
            `SELECT year, anom as anomaly, month FROM roni ORDER BY center_month DESC LIMIT 1`
        );
        console.log(rows);
        return (rows[0]);
    }
    _mapRow(row) {
        if (!row) return null;
        return new OniObservation({
            year: row.year,
            season: row.season,
            anomaly: Number(row.anomaly),
            source: row.source,
            centerDate: row.center_date instanceof Date
                ? row.center_date.toISOString().slice(0, 10)
                : row.center_date,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }
}