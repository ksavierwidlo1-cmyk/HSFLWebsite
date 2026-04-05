-- ============================================================
--  HSFL COMPLETE DATABASE SCHEMA
--  Run this in your Supabase SQL Editor on a fresh project.
--  Everything the website needs is in this single file.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────
--  HELPER: auto-update updated_at on every row change
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
--  CORE HSFL TABLES
-- ============================================================

-- ── Teams ──────────────────────────────────────────────────
CREATE TABLE teams (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  logo             TEXT,
  owner            TEXT,
  general_manager  TEXT,
  head_coach       TEXT,
  assistant_coaches TEXT[],
  conference       TEXT NOT NULL CHECK (conference IN ('Eastern', 'Western')),
  primary_color    TEXT NOT NULL DEFAULT '#1872de',
  secondary_color  TEXT NOT NULL DEFAULT '#0A0E27',
  created_at       TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at       TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Seasons ────────────────────────────────────────────────
CREATE TABLE seasons (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL UNIQUE,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "isCurrent"    BOOLEAN DEFAULT false,
  "startDate"    DATE,
  "endDate"      DATE,
  "createdAt"    TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seasons_display_order ON seasons("displayOrder");
CREATE INDEX idx_seasons_is_current    ON seasons("isCurrent");

-- Default seasons
INSERT INTO seasons (name, "displayOrder", "isCurrent") VALUES
  ('Preseason 1', 0, true),
  ('Season 1',    1, false),
  ('Season 2',    2, false),
  ('Season 3',    3, false);

-- ── Team ↔ Season junction ─────────────────────────────────
CREATE TABLE team_seasons (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   UUID NOT NULL REFERENCES teams(id)   ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, season_id)
);

CREATE INDEX idx_team_seasons_team_id   ON team_seasons(team_id);
CREATE INDEX idx_team_seasons_season_id ON team_seasons(season_id);

-- ── Players ────────────────────────────────────────────────
CREATE TABLE players (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name     TEXT NOT NULL,
  roblox_username  TEXT NOT NULL,
  roblox_user_id   TEXT,
  user_id          TEXT,
  profile_picture  TEXT,
  description      TEXT,
  discord_username TEXT,
  team_id          UUID REFERENCES teams(id) ON DELETE SET NULL,
  roles            TEXT[] DEFAULT ARRAY['Player']::TEXT[],

  -- Football-specific
  jersey_number    INTEGER,
  positions        TEXT[] DEFAULT ARRAY[]::TEXT[],
  star_rating      INTEGER DEFAULT 0 CHECK (star_rating BETWEEN 0 AND 5),

  -- Legacy aggregate stat columns (kept for compatibility)
  games_played              INTEGER      DEFAULT 0,
  points                    DECIMAL(10,2) DEFAULT 0,
  rebounds                  DECIMAL(10,2) DEFAULT 0,
  assists                   DECIMAL(10,2) DEFAULT 0,
  steals                    DECIMAL(10,2) DEFAULT 0,
  blocks                    DECIMAL(10,2) DEFAULT 0,
  turnovers                 DECIMAL(10,2) DEFAULT 0,
  field_goals_made          INTEGER      DEFAULT 0,
  field_goals_attempted     INTEGER      DEFAULT 0,
  field_goal_percentage     DECIMAL(5,2)  DEFAULT 0,
  three_pointers_made       INTEGER      DEFAULT 0,
  three_pointers_attempted  INTEGER      DEFAULT 0,
  three_point_percentage    DECIMAL(5,2)  DEFAULT 0,
  free_throws_made          INTEGER      DEFAULT 0,
  free_throws_attempted     INTEGER      DEFAULT 0,
  free_throw_percentage     DECIMAL(5,2)  DEFAULT 0,
  fouls                     INTEGER      DEFAULT 0,
  assist_turnover_ratio     DECIMAL(10,2) DEFAULT 0,
  assist_percentage         DECIMAL(10,2) DEFAULT 0,
  efficiency                DECIMAL(10,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_players_team_id         ON players(team_id);
CREATE INDEX idx_players_roblox_username ON players(roblox_username);

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Games ──────────────────────────────────────────────────
CREATE TABLE games (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  home_score     INTEGER,
  away_score     INTEGER,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'completed')) DEFAULT 'scheduled',
  season         TEXT NOT NULL DEFAULT 'Preseason 1',
  is_forfeit     BOOLEAN DEFAULT FALSE,
  forfeit_winner TEXT,
  created_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_games_home_team     ON games(home_team_id);
CREATE INDEX idx_games_away_team     ON games(away_team_id);
CREATE INDEX idx_games_status        ON games(status);
CREATE INDEX idx_games_scheduled     ON games(scheduled_date);

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Game Stats (per-player per-game) ───────────────────────
CREATE TABLE game_stats (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id    UUID NOT NULL REFERENCES games(id)   ON DELETE CASCADE,
  date       TIMESTAMPTZ NOT NULL,
  opponent   TEXT NOT NULL,
  result     TEXT CHECK (result IN ('W', 'L')),
  minutes_played INTEGER DEFAULT 0,

  -- ── Passing ──
  completions    INTEGER DEFAULT 0,
  pass_attempts  INTEGER DEFAULT 0,
  passing_yards  INTEGER DEFAULT 0,
  passing_tds    INTEGER DEFAULT 0,
  interceptions  INTEGER DEFAULT 0,
  passe_fumbles  INTEGER DEFAULT 0,
  sacks_taken    INTEGER DEFAULT 0,

  -- ── Rushing ──
  rush_attempts  INTEGER DEFAULT 0,
  rushing_yards  INTEGER DEFAULT 0,
  rushing_tds    INTEGER DEFAULT 0,
  rush_fumbles   INTEGER DEFAULT 0,

  -- ── Receiving ──
  receptions      INTEGER DEFAULT 0,
  targets         INTEGER DEFAULT 0,
  receiving_yards INTEGER DEFAULT 0,
  receiving_tds   INTEGER DEFAULT 0,
  rec_fumbles     INTEGER DEFAULT 0,

  -- ── Offensive Line ──
  snaps         INTEGER DEFAULT 0,
  sacks_allowed INTEGER DEFAULT 0,

  -- ── Defense ──
  tackles           INTEGER DEFAULT 0,
  tackles_for_loss  INTEGER DEFAULT 0,
  defensive_sacks   INTEGER DEFAULT 0,
  hurries           INTEGER DEFAULT 0,
  safeties          INTEGER DEFAULT 0,
  def_interceptions INTEGER DEFAULT 0,
  pass_breakups     INTEGER DEFAULT 0,
  receptions_allowed INTEGER DEFAULT 0,
  targets_defended  INTEGER DEFAULT 0,
  yards_allowed     INTEGER DEFAULT 0,
  touchdowns_allowed INTEGER DEFAULT 0,
  defensive_tds     INTEGER DEFAULT 0,
  forced_fumbles    INTEGER DEFAULT 0,
  fumble_recoveries INTEGER DEFAULT 0,

  -- ── Kicking ──
  field_goals_made      INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  extra_points_made     INTEGER DEFAULT 0,
  extra_points_attempted INTEGER DEFAULT 0,

  -- ── Returns ──
  returns       INTEGER DEFAULT 0,
  return_yards  INTEGER DEFAULT 0,
  return_tds    INTEGER DEFAULT 0,
  return_fumbles INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_game_stats_player_id ON game_stats(player_id);
CREATE INDEX idx_game_stats_game_id   ON game_stats(game_id);

CREATE TRIGGER update_game_stats_updated_at
  BEFORE UPDATE ON game_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Articles ───────────────────────────────────────────────
CREATE TABLE articles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  content        TEXT NOT NULL,
  author         TEXT NOT NULL,
  published_date TIMESTAMPTZ NOT NULL,
  cover_image    TEXT,
  excerpt        TEXT,
  created_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_articles_published_date ON articles(published_date);

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Article Likes ──────────────────────────────────────────
CREATE TABLE article_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, player_id)
);

CREATE INDEX idx_article_likes_article ON article_likes(article_id);
CREATE INDEX idx_article_likes_player  ON article_likes(player_id);

-- ── Article Comments ───────────────────────────────────────
CREATE TABLE article_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_article_comments_article ON article_comments(article_id);
CREATE INDEX idx_article_comments_player  ON article_comments(player_id);

-- ── Article Comment Likes ──────────────────────────────────
CREATE TABLE article_comment_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES article_comments(id) ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, player_id)
);

CREATE INDEX idx_comment_likes_comment ON article_comment_likes(comment_id);
CREATE INDEX idx_comment_likes_player  ON article_comment_likes(player_id);

-- ── Team Wall Posts ────────────────────────────────────────
CREATE TABLE team_wall_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID NOT NULL REFERENCES teams(id)   ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  is_pinned  BOOLEAN DEFAULT FALSE,
  pinned_at  TIMESTAMPTZ,
  pinned_by  UUID REFERENCES players(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_wall_posts_team   ON team_wall_posts(team_id);
CREATE INDEX idx_team_wall_posts_player ON team_wall_posts(player_id);
CREATE INDEX idx_team_wall_posts_pinned ON team_wall_posts(is_pinned, created_at);

-- ── Staff ──────────────────────────────────────────────────
CREATE TABLE staff (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_staff_player_id  ON staff(player_id);
CREATE INDEX idx_staff_role       ON staff(role);
CREATE INDEX idx_staff_created_at ON staff(created_at DESC);

-- ── Accolades (Award Definitions) ─────────────────────────
CREATE TABLE accolades (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL UNIQUE,
  abbreviation  TEXT NOT NULL,
  description   TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at    TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_accolades_updated_at
  BEFORE UPDATE ON accolades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Player Accolades (Award Instances) ────────────────────
CREATE TABLE player_accolades (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id    UUID NOT NULL REFERENCES players(id)   ON DELETE CASCADE,
  accolade_id  UUID NOT NULL REFERENCES accolades(id) ON DELETE CASCADE,
  season_id    UUID REFERENCES seasons(id) ON DELETE SET NULL,
  season_name  TEXT NOT NULL,
  awarded_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  created_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(player_id, accolade_id, season_id)
);

CREATE INDEX idx_player_accolades_player_id  ON player_accolades(player_id);
CREATE INDEX idx_player_accolades_accolade_id ON player_accolades(accolade_id);
CREATE INDEX idx_player_accolades_season_id  ON player_accolades(season_id);

CREATE TRIGGER update_player_accolades_updated_at
  BEFORE UPDATE ON player_accolades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Live Stream ────────────────────────────────────────────
CREATE TABLE live_stream (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twitch_channel TEXT NOT NULL,
  title          TEXT NOT NULL,
  is_live        BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Only one active stream at a time
CREATE UNIQUE INDEX idx_live_stream_active ON live_stream(is_live) WHERE is_live = true;

-- ============================================================
--  ELEVATE 302 (COLLEGE LEAGUE) TABLES
-- ============================================================

CREATE TABLE elevate302_teams (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  logo             TEXT,
  owner            TEXT,
  general_manager  TEXT,
  head_coach       TEXT,
  assistant_coaches TEXT[],
  conference       TEXT NOT NULL CHECK (conference IN ('Eastern', 'Western')),
  primary_color    TEXT NOT NULL DEFAULT '#8cd2fe',
  secondary_color  TEXT NOT NULL DEFAULT '#0A0E27',
  created_at       TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at       TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE elevate302_players (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name     TEXT NOT NULL,
  roblox_username  TEXT NOT NULL,
  roblox_user_id   TEXT NOT NULL,
  profile_picture  TEXT,
  description      TEXT,
  discord_username TEXT,
  team_id          UUID REFERENCES elevate302_teams(id) ON DELETE SET NULL,
  roles            TEXT[] DEFAULT ARRAY['Player']::TEXT[],
  games_played              INTEGER      DEFAULT 0,
  points                    DECIMAL(10,2) DEFAULT 0,
  rebounds                  DECIMAL(10,2) DEFAULT 0,
  assists                   DECIMAL(10,2) DEFAULT 0,
  steals                    DECIMAL(10,2) DEFAULT 0,
  blocks                    DECIMAL(10,2) DEFAULT 0,
  turnovers                 DECIMAL(10,2) DEFAULT 0,
  field_goals_made          INTEGER      DEFAULT 0,
  field_goals_attempted     INTEGER      DEFAULT 0,
  field_goal_percentage     DECIMAL(5,2)  DEFAULT 0,
  three_pointers_made       INTEGER      DEFAULT 0,
  three_pointers_attempted  INTEGER      DEFAULT 0,
  three_point_percentage    DECIMAL(5,2)  DEFAULT 0,
  free_throws_made          INTEGER      DEFAULT 0,
  free_throws_attempted     INTEGER      DEFAULT 0,
  free_throw_percentage     DECIMAL(5,2)  DEFAULT 0,
  fouls                     INTEGER      DEFAULT 0,
  assist_turnover_ratio     DECIMAL(10,2) DEFAULT 0,
  assist_percentage         DECIMAL(10,2) DEFAULT 0,
  efficiency                DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE elevate302_games (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id   UUID NOT NULL REFERENCES elevate302_teams(id) ON DELETE CASCADE,
  away_team_id   UUID NOT NULL REFERENCES elevate302_teams(id) ON DELETE CASCADE,
  home_score     INTEGER,
  away_score     INTEGER,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'completed')) DEFAULT 'scheduled',
  season         TEXT NOT NULL DEFAULT 'Preseason 1',
  created_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE elevate302_game_stats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES elevate302_players(id) ON DELETE CASCADE,
  game_id    UUID NOT NULL REFERENCES elevate302_games(id)   ON DELETE CASCADE,
  date       TIMESTAMPTZ NOT NULL,
  opponent   TEXT NOT NULL,
  points     INTEGER DEFAULT 0,
  rebounds   INTEGER DEFAULT 0,
  assists    INTEGER DEFAULT 0,
  steals     INTEGER DEFAULT 0,
  blocks     INTEGER DEFAULT 0,
  turnovers  INTEGER DEFAULT 0,
  field_goals_made      INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  three_pointers_made   INTEGER DEFAULT 0,
  three_pointers_attempted INTEGER DEFAULT 0,
  free_throws_made      INTEGER DEFAULT 0,
  free_throws_attempted INTEGER DEFAULT 0,
  fouls          INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,
  result TEXT CHECK (result IN ('W', 'L')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE elevate302_staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,
  team_id         UUID REFERENCES elevate302_teams(id) ON DELETE SET NULL,
  bio             TEXT,
  profile_picture TEXT,
  created_at      TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at      TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Elevate 302 indexes
CREATE INDEX idx_elevate302_players_team_id        ON elevate302_players(team_id);
CREATE INDEX idx_elevate302_games_home_team_id      ON elevate302_games(home_team_id);
CREATE INDEX idx_elevate302_games_away_team_id      ON elevate302_games(away_team_id);
CREATE INDEX idx_elevate302_games_scheduled_date    ON elevate302_games(scheduled_date);
CREATE INDEX idx_elevate302_game_stats_player_id    ON elevate302_game_stats(player_id);
CREATE INDEX idx_elevate302_game_stats_game_id      ON elevate302_game_stats(game_id);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE teams                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons                ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_seasons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE players                ENABLE ROW LEVEL SECURITY;
ALTER TABLE games                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats             ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comment_likes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_wall_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE accolades              ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_accolades       ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream            ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevate302_teams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevate302_players     ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevate302_games       ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevate302_game_stats  ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevate302_staff       ENABLE ROW LEVEL SECURITY;

-- Public read + full write for all tables
-- (The app authenticates admin actions via NextAuth + server-side checks,
--  not Supabase RLS, so these simple policies are intentional.)
CREATE POLICY "public_read"  ON teams                 FOR SELECT USING (true);
CREATE POLICY "public_write" ON teams                 FOR ALL    USING (true);

CREATE POLICY "public_read"  ON seasons               FOR SELECT USING (true);
CREATE POLICY "public_write" ON seasons               FOR ALL    USING (true) WITH CHECK (true);

CREATE POLICY "public_read"  ON team_seasons          FOR SELECT USING (true);
CREATE POLICY "public_write" ON team_seasons          FOR ALL    USING (true) WITH CHECK (true);

CREATE POLICY "public_read"  ON players               FOR SELECT USING (true);
CREATE POLICY "public_write" ON players               FOR ALL    USING (true);

CREATE POLICY "public_read"  ON games                 FOR SELECT USING (true);
CREATE POLICY "public_write" ON games                 FOR ALL    USING (true);

CREATE POLICY "public_read"  ON game_stats            FOR SELECT USING (true);
CREATE POLICY "public_write" ON game_stats            FOR ALL    USING (true);

CREATE POLICY "public_read"  ON articles              FOR SELECT USING (true);
CREATE POLICY "public_write" ON articles              FOR ALL    USING (true);

CREATE POLICY "public_read"  ON article_likes         FOR SELECT USING (true);
CREATE POLICY "public_write" ON article_likes         FOR ALL    USING (true);

CREATE POLICY "public_read"  ON article_comments      FOR SELECT USING (true);
CREATE POLICY "public_write" ON article_comments      FOR ALL    USING (true);

CREATE POLICY "public_read"  ON article_comment_likes FOR SELECT USING (true);
CREATE POLICY "public_write" ON article_comment_likes FOR ALL    USING (true);

CREATE POLICY "public_read"  ON team_wall_posts       FOR SELECT USING (true);
CREATE POLICY "public_write" ON team_wall_posts       FOR ALL    USING (true);

CREATE POLICY "public_read"  ON staff                 FOR SELECT USING (true);
CREATE POLICY "public_write" ON staff                 FOR ALL    USING (true);

CREATE POLICY "public_read"  ON accolades             FOR SELECT USING (true);
CREATE POLICY "public_write" ON accolades             FOR ALL    USING (true);

CREATE POLICY "public_read"  ON player_accolades      FOR SELECT USING (true);
CREATE POLICY "public_write" ON player_accolades      FOR ALL    USING (true);

CREATE POLICY "public_read"  ON live_stream           FOR SELECT USING (true);
CREATE POLICY "public_write" ON live_stream           FOR ALL    USING (true);

CREATE POLICY "public_read"  ON elevate302_teams      FOR SELECT USING (true);
CREATE POLICY "public_write" ON elevate302_teams      FOR ALL    USING (true);

CREATE POLICY "public_read"  ON elevate302_players    FOR SELECT USING (true);
CREATE POLICY "public_write" ON elevate302_players    FOR ALL    USING (true);

CREATE POLICY "public_read"  ON elevate302_games      FOR SELECT USING (true);
CREATE POLICY "public_write" ON elevate302_games      FOR ALL    USING (true);

CREATE POLICY "public_read"  ON elevate302_game_stats FOR SELECT USING (true);
CREATE POLICY "public_write" ON elevate302_game_stats FOR ALL    USING (true);

CREATE POLICY "public_read"  ON elevate302_staff      FOR SELECT USING (true);
CREATE POLICY "public_write" ON elevate302_staff      FOR ALL    USING (true);

-- ============================================================
--  SEED DATA: Default Accolades
-- ============================================================
INSERT INTO accolades (name, abbreviation, description, display_order) VALUES
  ('Most Valuable Player',        'MVP',         'Season MVP award',                          1),
  ('Player of the Year',          'POTY',        'Player of the Year award',                  2),
  ('Finals MVP',                  'Finals-MVP',  'Finals Most Valuable Player',               3),
  ('Defensive Player of the Year','DPOY',        'Best defensive player of the season',       4),
  ('Coach of the Year',           'COTY',        'Best coach of the season',                  5),
  ('Clutch Player of the Year',   'CPOY',        'Most clutch player of the season',          6),
  ('Rookie of the Year',          'ROTY',        'Best rookie player',                        7),
  ('Most Improved Player',        'MIP',         'Most improved player of the season',        8),
  ('Sixth Man of the Year',       '6MOTY',       'Best player coming off the bench',          9),
  ('All-Star',                    'All-Star',    'Selected to the All-Star game',            10),
  ('All-HSFL First Team',         '1st Team',    'First Team All-HSFL selection',            11),
  ('All-HSFL Second Team',        '2nd Team',    'Second Team All-HSFL selection',           12),
  ('All-Defensive Team',          'All-Defense', 'All-Defensive Team selection',             13),
  ('Finals Champion',             'Champion',    'Won the Finals championship',              14)
ON CONFLICT (name) DO NOTHING;
