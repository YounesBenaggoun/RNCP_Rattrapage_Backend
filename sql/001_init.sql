CREATE TABLE IF NOT EXISTS roni (
  id           BIGSERIAL PRIMARY KEY,
  season       CHAR(3)       NOT NULL,   -- DJF, JFM, ... NDJ
  year         SMALLINT      NOT NULL,   -- année de la colonne YR du fichier NOAA
  center_month SMALLINT      NOT NULL,   -- mois central de la saison (1..12)
  anom         NUMERIC(5, 2) NOT NULL,   -- anomalie RONI (°C)
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- Contrôle des doublons : une seule ligne par (saison, année)
  CONSTRAINT roni_season_year_uniq UNIQUE (season, year),
  CONSTRAINT roni_season_chk CHECK (
    season IN ('DJF','JFM','FMA','MAM','AMJ','MJJ','JJA','JAS','ASO','SON','OND','NDJ')
  ),
  CONSTRAINT roni_center_month_chk CHECK (center_month BETWEEN 1 AND 12)
);

CREATE INDEX IF NOT EXISTS roni_center_month_idx ON roni (center_month);