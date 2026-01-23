-- Elevate 302 Database Schema
-- This creates separate tables for the Elevate 302 college league

-- Elevate 302 Teams Table
CREATE TABLE elevate302_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  owner TEXT,
  general_manager TEXT,
  head_coach TEXT,
  assistant_coaches TEXT[],
  conference TEXT NOT NULL CHECK (conference IN ('Eastern', 'Western')),
  primary_color TEXT NOT NULL DEFAULT '#8cd2fe',
  secondary_color TEXT NOT NULL DEFAULT '#0A0E27',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Elevate 302 Players Table
CREATE TABLE elevate302_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  roblox_username TEXT NOT NULL,
  roblox_user_id TEXT NOT NULL,
  profile_picture TEXT,
  description TEXT,
  discord_username TEXT,
  team_id UUID REFERENCES elevate302_teams(id) ON DELETE SET NULL,
  roles TEXT[] DEFAULT ARRAY['Player']::TEXT[],
  
  -- Stats
  games_played INTEGER DEFAULT 0,
  points DECIMAL(10,2) DEFAULT 0,
  rebounds DECIMAL(10,2) DEFAULT 0,
  assists DECIMAL(10,2) DEFAULT 0,
  steals DECIMAL(10,2) DEFAULT 0,
  blocks DECIMAL(10,2) DEFAULT 0,
  turnovers DECIMAL(10,2) DEFAULT 0,
  field_goals_made INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  field_goal_percentage DECIMAL(5,2) DEFAULT 0,
  three_pointers_made INTEGER DEFAULT 0,
  three_pointers_attempted INTEGER DEFAULT 0,
  three_point_percentage DECIMAL(5,2) DEFAULT 0,
  free_throws_made INTEGER DEFAULT 0,
  free_throws_attempted INTEGER DEFAULT 0,
  free_throw_percentage DECIMAL(5,2) DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  assist_turnover_ratio DECIMAL(10,2) DEFAULT 0,
  assist_percentage DECIMAL(10,2) DEFAULT 0,
  efficiency DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Elevate 302 Games Table
CREATE TABLE elevate302_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID NOT NULL REFERENCES elevate302_teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES elevate302_teams(id) ON DELETE CASCADE,
  home_score INTEGER,
  away_score INTEGER,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'completed')) DEFAULT 'scheduled',
  season TEXT NOT NULL DEFAULT 'Preseason 1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Elevate 302 Game Stats Table
CREATE TABLE elevate302_game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES elevate302_players(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES elevate302_games(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  opponent TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  rebounds INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  steals INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  turnovers INTEGER DEFAULT 0,
  field_goals_made INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  three_pointers_made INTEGER DEFAULT 0,
  three_pointers_attempted INTEGER DEFAULT 0,
  free_throws_made INTEGER DEFAULT 0,
  free_throws_attempted INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,
  result TEXT CHECK (result IN ('W', 'L')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Elevate 302 Staff Table
CREATE TABLE elevate302_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  team_id UUID REFERENCES elevate302_teams(id) ON DELETE SET NULL,
  bio TEXT,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE elevate302_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevate302_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevate302_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevate302_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevate302_staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "Allow public read access to elevate302_teams"
  ON elevate302_teams FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to elevate302_players"
  ON elevate302_players FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to elevate302_games"
  ON elevate302_games FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to elevate302_game_stats"
  ON elevate302_game_stats FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to elevate302_staff"
  ON elevate302_staff FOR SELECT
  USING (true);

-- RLS Policies - Allow authenticated users to manage (admins will control this via middleware)
CREATE POLICY "Allow authenticated users to manage elevate302_teams"
  ON elevate302_teams FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage elevate302_players"
  ON elevate302_players FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage elevate302_games"
  ON elevate302_games FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage elevate302_game_stats"
  ON elevate302_game_stats FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage elevate302_staff"
  ON elevate302_staff FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_elevate302_players_team_id ON elevate302_players(team_id);
CREATE INDEX idx_elevate302_games_home_team_id ON elevate302_games(home_team_id);
CREATE INDEX idx_elevate302_games_away_team_id ON elevate302_games(away_team_id);
CREATE INDEX idx_elevate302_games_scheduled_date ON elevate302_games(scheduled_date);
CREATE INDEX idx_elevate302_game_stats_player_id ON elevate302_game_stats(player_id);
CREATE INDEX idx_elevate302_game_stats_game_id ON elevate302_game_stats(game_id);
CREATE INDEX idx_elevate302_game_stats_date ON elevate302_game_stats(date);
