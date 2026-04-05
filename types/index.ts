// Type definitions for the HSFL Football League website

export const POSITIONS = [
  { abbr: 'C',  name: 'Center' },
  { abbr: 'OG', name: 'Offensive Guard' },
  { abbr: 'OT', name: 'Offensive Tackle' },
  { abbr: 'QB', name: 'Quarterback' },
  { abbr: 'RB', name: 'Running Back' },
  { abbr: 'WR', name: 'Wide Receiver' },
  { abbr: 'TE', name: 'Tight End' },
  { abbr: 'K',  name: 'Kicker' },
  { abbr: 'CB', name: 'Cornerback' },
  { abbr: 'LB', name: 'Linebacker' },
  { abbr: 'DT', name: 'Defensive Tackle' },
  { abbr: 'DE', name: 'Defensive End' },
  { abbr: 'S',  name: 'Safety' },
] as const;

export type PositionAbbr = typeof POSITIONS[number]['abbr'];

export interface GameStats {
  id: string;
  playerId: string;
  gameId: string;
  date: string;
  opponent: string;
  result: 'W' | 'L';
  // Passing
  completions?: number;
  passAttempts?: number;
  passingYards?: number;
  passingTDs?: number;
  interceptions?: number;
  passeFumbles?: number;
  sacksTaken?: number;
  // Rushing
  rushAttempts?: number;
  rushingYards?: number;
  rushingTDs?: number;
  rushFumbles?: number;
  // Receiving
  receptions?: number;
  targets?: number;
  receivingYards?: number;
  receivingTDs?: number;
  recFumbles?: number;
  // Blocking
  snaps?: number;
  sacksAllowed?: number;
  // Defense
  tackles?: number;
  tacklesForLoss?: number;
  defensiveSacks?: number;
  hurries?: number;
  safeties?: number;
  defInterceptions?: number;
  passBreakups?: number;
  receptionsAllowed?: number;
  targetsDefended?: number;
  yardsAllowed?: number;
  touchdownsAllowed?: number;
  defensiveTDs?: number;
  forcedFumbles?: number;
  fumbleRecoveries?: number;
  // Kicking
  fieldGoalsMade?: number;
  fieldGoalsAttempted?: number;
  extraPointsMade?: number;
  extraPointsAttempted?: number;
  // Returning
  returns?: number;
  returnYards?: number;
  returnTDs?: number;
  returnFumbles?: number;
}

export interface Player {
  id: string;
  displayName: string;
  robloxUsername: string;
  robloxUserId: string;
  profilePicture: string;
  description?: string;
  discordUsername?: string;
  teamId?: string;
  jerseyNumber?: number;
  positions?: PositionAbbr[];
  roles: PlayerRole[];
  stats: PlayerStats;
  gameStats?: GameStats[];
}

export interface PlayerStats {
  gamesPlayed: number;
  // Legacy aggregate fields (populated by admin or computed)
  passingYards?: number;
  rushingYards?: number;
  receivingYards?: number;
}

export type PlayerRole = 
  | 'Player'
  | 'Franchise Owner'
  | 'General Manager'
  | 'Head Coach'
  | 'Assistant Coach';

export interface Team {
  id: string;
  name: string;
  logo?: string;
  owner?: string;
  generalManager?: string;
  headCoach?: string;
  assistantCoaches: string[];
  conference: 'Eastern' | 'Western';
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface Game {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  scheduledDate: string;
  status: 'scheduled' | 'live' | 'completed';
  season: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedDate: string;
  coverImage?: string;
  excerpt?: string;
}

export interface Accolade {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
  displayOrder: number;
}

export interface PlayerAccolade {
  id: string;
  playerId: string;
  accoladeId: string;
  seasonId?: string;
  seasonName: string;
  awardedDate: string;
  accolade?: Accolade;
}
