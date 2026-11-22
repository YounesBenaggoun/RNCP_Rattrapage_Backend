import { SEASONS } from './importData/constants.js';

export const MIN_YEAR = 1950;
export const MAX_ANOM = 5; // °C, borne de sécurité (valeurs réelles ~ -2.0 à +2.5)
export const MIN_ROWS = 100; // un fichier quasi vide est suspect -> on refuse d'importer


export function validateRow({ season, year, anom }, context = '') {
  const where = context ? ` (${context})` : '';
  if (!SEASONS.includes(season)) throw new Error(`Saison inconnue "${season}"${where}`);

  const maxYear = new Date().getUTCFullYear() + 1;
  if (!Number.isInteger(year) || year < MIN_YEAR || year > maxYear) {
    throw new Error(`Année hors limites ${MIN_YEAR}-${maxYear} : ${year}${where}`);
  }
  if (!Number.isFinite(anom) || Math.abs(anom) > MAX_ANOM) {
    throw new Error(`Anomalie hors limites ±${MAX_ANOM} : ${anom}${where}`);
  }
}

/** Vérifie la structure globale du fichier avant de l'importer. */
export function validateFileHeader(text) {
  const firstLine = text.split(/\r?\n/, 1)[0].trim();
  if (!/^SEAS\s+YR\s+ANOM$/i.test(firstLine)) {
    throw new Error(`En-tête inattendu "${firstLine.slice(0, 60)}" (attendu : SEAS YR ANOM). Format NOAA modifié ?`);
  }
}

export function validateRowCount(count) {
  if (count < MIN_ROWS) {
    throw new Error(`Seulement ${count} lignes (minimum ${MIN_ROWS}) : import annulé par sécurité.`);
  }
}
