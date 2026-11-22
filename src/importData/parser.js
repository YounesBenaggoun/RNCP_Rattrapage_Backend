import { SEASONS } from './importData/constants.js';
import { validateRow } from './validation.js';


const LINE_RE = /^([A-Z]{3})\s+(\d{4})\s+(-?\d+(?:\.\d+)?)$/;

/**
 * Parse le fichier RONI.ascii.txt (colonnes SEAS YR ANOM).
 * - ignore l'en-tête et les lignes vides
 * - lève une erreur sur toute ligne invalide (pas d'import silencieux de données corrompues)
 * - dédoublonne dans le fichier lui-même sur (season, year) : la dernière occurrence gagne
 */
export function parseRoni(text) {
  const byKey = new Map();
  let duplicatesInFile = 0;

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || /^SEAS\b/i.test(line)) continue;

    const m = LINE_RE.exec(line);
    if (!m) throw new Error(`Ligne ${i + 1} invalide : "${line}"`);

    const season = m[1];
    const year = Number(m[2]);
    const anom = Number(m[3]);

    const idx = SEASONS.indexOf(season);
    if (idx === -1) throw new Error(`Ligne ${i + 1} : saison inconnue "${season}"`);

    validateRow({ season, year, anom }, `ligne ${i + 1}`);

    const key = `${season}-${year}`;
    if (byKey.has(key)) duplicatesInFile++;

    const month = idx + 1;
    // DJF -> janvier, JFM -> février, ..., NDJ -> décembre (mois central)
    const centerMonth = `${year}-${String(idx + 1).padStart(2, '0')}-01`;
    byKey.set(key, { season, year, month, centerMonth, anom });
  }

  return { rows: [...byKey.values()], duplicatesInFile };
}

