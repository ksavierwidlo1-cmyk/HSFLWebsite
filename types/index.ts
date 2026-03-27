// Type definitions for the EBA Basketball League website

export interface GameStats {
  id: string;
  playerId: string;
  gameId: string;
  date: string;
  opponent: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  fouls: number;
  result: 'W' | 'L';
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
  roles: PlayerRole[];
  stats: PlayerStats;
  gameStats?: GameStats[];
}

export interface PlayerStats {
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalPercentage: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowPercentage: number;
  fouls: number;
  assistTurnoverRatio: number;
  assistPercentage: number;
  efficiency: number;
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
