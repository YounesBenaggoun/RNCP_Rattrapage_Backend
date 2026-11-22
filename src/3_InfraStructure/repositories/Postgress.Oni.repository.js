
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
            `SELECT year, anomaly AS oni, season_index AS month
             FROM public.oni_observations
             WHERE center_date BETWEEN $1::date AND $2::date
             ORDER BY year ASC, season_index ASC`,
            [start, end]
        );

        return tab.rows;
    }

    async getAll() {
        const tab = await this.pool.query(
            `SELECT year , anomaly as oni , season_index as month
     FROM public.oni_observations
     ORDER BY year ASC, season_index ASC`
        );
        const result = tab.rows;
        return result;
    }


    async findDuplicatedData() {
        const tab = await this.pool.query(
            `SELECT
                year,
                anomaly AS oni,
                season_index AS month,
            COUNT(*) AS occurrences
            FROM public.oni_observations
            GROUP BY year, anomaly, season_index
            HAVING COUNT(*) > 1
            ORDER BY year ASC, season_index ASC`
        );
        const result = tab.rows.length;
        return `There are ${result} duplicated Data`;
    }
    async stats() {
        const { rows } = await this.pool.query(`
      SELECT
        COUNT(*)::int                                                  AS total,
        COUNT(*) FILTER (WHERE anomaly >= 0.5)::int                    AS el_nino,
        COUNT(*) FILTER (WHERE anomaly <= -0.5)::int                   AS la_nina,
        COUNT(*) FILTER (WHERE anomaly > -0.5 AND anomaly < 0.5)::int  AS neutral,
        MIN(center_date)                                               AS first_date,
        MAX(center_date)                                               AS last_date,
        AVG(anomaly)::numeric(6,3)                                     AS avg_anomaly
      FROM oni_observations
    `);
        return rows[0];
    }
    async findLatest() {
        const { rows } = await this.pool.query(
            `SELECT * FROM oni_observations ORDER BY center_date DESC LIMIT 1`
        );
        console.log(rows);
        return this._mapRow(rows[0]);
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