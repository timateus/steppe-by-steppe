-- One row per player per daily route.
CREATE TABLE IF NOT EXISTS results (
  day      TEXT    NOT NULL,           -- YYYY-MM-DD (player's local date of the daily route)
  map      TEXT    NOT NULL,           -- 'core' or 'gs'
  route    TEXT    NOT NULL,           -- 'START>END' region codes
  client   TEXT    NOT NULL,           -- random id kept in the player's browser
  guesses  INTEGER NOT NULL,
  shortest INTEGER NOT NULL,
  won      INTEGER NOT NULL,
  hints    INTEGER NOT NULL,
  borders  INTEGER NOT NULL,
  ts       INTEGER NOT NULL,
  PRIMARY KEY (day, map, route, client)
);
