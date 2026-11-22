-- Schéma ENSO : Oceanic Niño Index (ONI) = anomalie de température de surface de la mer
-- (région Niño 3.4) moyennée sur 3 mois glissants, en °C.
-- Script rejouable : peut être relancé sans erreur sur une base existante.

-- Rang (1..12) du mois central d'une saison de 3 mois : DJF -> 1 (janvier) ... NDJ -> 12 (décembre).
CREATE OR REPLACE FUNCTION oni_season_index(season TEXT) RETURNS SMALLINT
LANGUAGE SQL IMMUTABLE STRICT PARALLEL SAFE
AS $$
  SELECT array_position(
    ARRAY['DJF','JFM','FMA','MAM','AMJ','MJJ','JJA','JAS','ASO','SON','OND','NDJ'],
    season
  )::smallint
$$;

CREATE TABLE IF NOT EXISTS oni_observations (
  year         SMALLINT     NOT NULL CHECK (year BETWEEN 1800 AND 2200),
  season       TEXT         NOT NULL CHECK (oni_season_index(season) IS NOT NULL),
  anomaly      NUMERIC(4,2) NOT NULL,
  season_index SMALLINT     GENERATED ALWAYS AS (oni_season_index(season)) STORED,
  center_date  DATE         GENERATED ALWAYS AS (make_date(year::int, oni_season_index(season)::int, 1)) STORED,
  source       TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (year, season)
);

CREATE UNIQUE INDEX IF NOT EXISTS oni_observations_center_date_key ON oni_observations (center_date);

COMMENT ON TABLE  oni_observations IS 'Oceanic Niño Index (ONI) : une ligne par saison glissante de 3 mois.';
COMMENT ON COLUMN oni_observations.year IS 'Année du mois central de la saison (NDJ 1950 = nov. 1950 – janv. 1951, centrée sur déc. 1950).';
COMMENT ON COLUMN oni_observations.season IS 'DJF, JFM, FMA, MAM, AMJ, MJJ, JJA, JAS, ASO, SON, OND ou NDJ.';
COMMENT ON COLUMN oni_observations.anomaly IS 'Anomalie en °C. >= +0.5 : saison chaude (El Niño possible) ; <= -0.5 : saison froide (La Niña possible).';
COMMENT ON COLUMN oni_observations.center_date IS 'Premier jour du mois central de la saison (colonne calculée).';
COMMENT ON COLUMN oni_observations.source IS 'Jeu de données d''origine, ex. « NOAA CPC ONI v6 ».';