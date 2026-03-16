-- Create team_seasons junction table to allow teams to be assigned to multiple seasons
CREATE TABLE IF NOT EXISTS team_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate assignments
  UNIQUE(team_id, season_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_team_seasons_team_id ON team_seasons(team_id);
CREATE INDEX idx_team_seasons_season_id ON team_seasons(season_id);

-- Enable RLS
ALTER TABLE team_seasons ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to team_seasons"
  ON team_seasons FOR SELECT
  USING (true);

-- Allow authenticated users to manage team_seasons
CREATE POLICY "Allow authenticated users to manage team_seasons"
  ON team_seasons FOR ALL
  USING (true)
  WITH CHECK (true);

-- Assign all existing teams to all existing seasons
INSERT INTO team_seasons (team_id, season_id)
SELECT t.id, s.id
FROM teams t
CROSS JOIN seasons s
ON CONFLICT (team_id, season_id) DO NOTHING;
