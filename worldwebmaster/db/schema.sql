CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  moderation_status TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  thumbnail_key TEXT,
  country_id TEXT,
  destination_id TEXT,
  event_id TEXT,
  experience_id TEXT,
  contributor_name TEXT,
  contributor_contact TEXT,
  caption TEXT,
  source TEXT,
  license TEXT,
  attribution TEXT,
  created_at TEXT NOT NULL,
  approved_at TEXT
);

CREATE TABLE IF NOT EXISTS media_submissions (
  id TEXT PRIMARY KEY,
  contributor_name TEXT,
  contributor_contact TEXT,
  destination_id TEXT,
  event_id TEXT,
  experience_id TEXT,
  consent_to_publish INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  route TEXT NOT NULL,
  domain TEXT,
  metadata_json TEXT
);

CREATE TABLE IF NOT EXISTS map_entities (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  country_id TEXT,
  coordinates_json TEXT,
  metadata_json TEXT
);
