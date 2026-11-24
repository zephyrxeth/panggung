-- Panggung schema (SQLite). Portable SQL; migration path to Postgres is straightforward.
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,          -- scrypt: salt:hash hex
  role TEXT NOT NULL DEFAULT 'scout',   -- scout | admin
  pseudonym_ok INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS venues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_id INTEGER NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS genres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  genre_id INTEGER REFERENCES genres(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'gig',     -- gig | concert | festival
  starts_at TEXT NOT NULL,              -- ISO 8601 UTC
  ends_at TEXT,
  city_id INTEGER NOT NULL REFERENCES cities(id),
  venue_id INTEGER REFERENCES venues(id),
  venue_text TEXT NOT NULL DEFAULT '',  -- free text fallback (small gigs may lack venue record)
  poster_path TEXT,                     -- /uploads/<file> or null
  ticket_url TEXT,                      -- official link; placeholder until real agreement
  price_info TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending_review',
    -- pending_review | verified | updated | cancelled | rejected
  verification_status TEXT NOT NULL DEFAULT 'unverified', -- unverified | source_checked | official
  created_by INTEGER REFERENCES users(id),
  submitted_by_role TEXT NOT NULL DEFAULT 'scout',        -- scout | promoter | community
  duplicate_of INTEGER REFERENCES events(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_city_status ON events(city_id, status, starts_at);

CREATE TABLE IF NOT EXISTS event_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'other', -- instagram | x | tiktok | website | ticketing | other
  evidence_path TEXT,
  submitted_by INTEGER REFERENCES users(id),
  checked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_artists (
  event_id INTEGER NOT NULL REFERENCES events(id),
  artist_id INTEGER NOT NULL REFERENCES artists(id),
  lineup_order INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'performer',
  PRIMARY KEY (event_id, artist_id)
);

CREATE TABLE IF NOT EXISTS event_genres (
  event_id INTEGER NOT NULL REFERENCES events(id),
  genre_id INTEGER NOT NULL REFERENCES genres(id),
  PRIMARY KEY (event_id, genre_id)
);

CREATE TABLE IF NOT EXISTS event_interest (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  event_id INTEGER NOT NULL REFERENCES events(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS artist_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  artist_id INTEGER NOT NULL REFERENCES artists(id),
  city_id INTEGER NOT NULL REFERENCES cities(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, artist_id, city_id)
);

CREATE TABLE IF NOT EXISTS moderation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL,   -- event | artist_request | report
  target_id INTEGER NOT NULL,
  moderator_id INTEGER NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,        -- approve | reject | edit | merge | cancel | resolve_report
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  reporter_email TEXT NOT NULL DEFAULT '',  -- optional; reports can be anonymous
  reason TEXT NOT NULL,                      -- wrong_date | cancelled | duplicate | suspicious_link | other
  detail TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',       -- open | resolved
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scout_contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  event_id INTEGER NOT NULL REFERENCES events(id),
  contribution_type TEXT NOT NULL,           -- submitted | corrected
  validation_status TEXT NOT NULL DEFAULT 'pending', -- pending | validated | rejected
  reputation_points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
