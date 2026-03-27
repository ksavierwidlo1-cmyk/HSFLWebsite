-- Create Accolades Tables
-- Run this in your Supabase SQL Editor to add accolades functionality

-- Accolades Table (defines available accolade types)
CREATE TABLE IF NOT EXISTS accolades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Player Accolades Table (links players to accolades with seasons)
CREATE TABLE IF NOT EXISTS player_accolades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  accolade_id UUID NOT NULL REFERENCES accolades(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  season_name TEXT NOT NULL,
  awarded_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(player_id, accolade_id, season_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_player_accolades_player_id ON player_accolades(player_id);
CREATE INDEX IF NOT EXISTS idx_player_accolades_accolade_id ON player_accolades(accolade_id);
CREATE INDEX IF NOT EXISTS idx_player_accolades_season_id ON player_accolades(season_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_accolades_updated_at BEFORE UPDATE ON accolades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_accolades_updated_at BEFORE UPDATE ON player_accolades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE accolades ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_accolades ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public accolades read access" ON accolades FOR SELECT USING (true);
CREATE POLICY "Public player_accolades read access" ON player_accolades FOR SELECT USING (true);

-- Public write access policies (allow all operations for now)
-- TODO: Restrict to admin users only once authentication is fully set up
CREATE POLICY "Public accolades write access" ON accolades FOR ALL USING (true);
CREATE POLICY "Public player_accolades write access" ON player_accolades FOR ALL USING (true);

-- Insert common accolades
INSERT INTO accolades (name, abbreviation, description, display_order) VALUES
  ('Most Valuable Player', 'MVP', 'Season MVP award', 1),
  ('Player of the Year', 'POTY', 'Player of the Year award', 2),
  ('Finals MVP', 'Finals-MVP', 'Finals Most Valuable Player', 3),
  ('Defensive Player of the Year', 'DPOY', 'Best defensive player of the season', 4),
  ('Coach of the Year', 'COTY', 'Best coach of the season', 5),
  ('Clutch Player of the Year', 'CPOY', 'Most clutch player of the season', 6),
  ('Rookie of the Year', 'ROTY', 'Best rookie player', 7),
  ('Most Improved Player', 'MIP', 'Most improved player of the season', 8),
  ('Sixth Man of the Year', '6MOTY', 'Best player coming off the bench', 9),
  ('All-Star', 'All-Star', 'Selected to the All-Star game', 10),
  ('All-EBA First Team', '1st Team', 'First Team All-EBA selection', 11),
  ('All-EBA Second Team', '2nd Team', 'Second Team All-EBA selection', 12),
  ('All-Defensive Team', 'All-Defense', 'All-Defensive Team selection', 13),
  ('Finals Champion', 'Champion', 'Won the Finals championship', 14)
ON CONFLICT (name) DO NOTHING;
