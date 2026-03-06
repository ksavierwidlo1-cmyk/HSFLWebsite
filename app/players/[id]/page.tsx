'use client';

import { User, Shield, Award, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import EditProfile from '@/components/EditProfile';
import MultiSeasonSelector from '@/components/MultiSeasonSelector';

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(['All-Time']);
  const [availableSeasons, setAvailableSeasons] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [imageError, setImageError] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    fetchData();
    fetchSeasons();
    setImageError(false); // Reset image error when player changes
  }, [params.id]);

  const fetchSeasons = async () => {
    try {
      const res = await fetch('/api/seasons');
      if (res.ok) {
        const seasons = await res.json();
        setAvailableSeasons(seasons);
        
        // Set current season as default
        const currentSeason = seasons.find((s: any) => s.isCurrent);
        if (currentSeason) {
          setSelectedSeasons([currentSeason.name]);
        } else if (seasons.length > 0) {
          setSelectedSeasons([seasons[0].name]);
        }
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes, gamesRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams'),
        fetch('/api/games')
      ]);
      const [playersData, teamsData, gamesData] = await Promise.all([
        playersRes.json(),
        teamsRes.json(),
        gamesRes.json()
      ]);
      
      const currentPlayer = playersData.find((p: any) => p.id === params.id);
      if (!currentPlayer) {
        notFound();
      }
      
      setPlayer(currentPlayer);
      setTeam(teamsData.find((t: any) => t.id === currentPlayer.teamId));
      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updates: any) => {
    try {
      const response = await fetch(`/api/players/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      // Refresh player data
      await fetchData();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const isOwnProfile = session?.user.playerId === params.id;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!player) {
    notFound();
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Franchise Owner':
        return <Shield className="w-4 h-4 text-eba-blue" />;
      case 'General Manager':
        return <Award className="w-4 h-4 text-eba-blue" />;
      case 'Head Coach':
      case 'Assistant Coach':
        return <UsersIcon className="w-4 h-4 text-eba-blue" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get season-filtered game stats
  const getSeasonGameStats = () => {
    if (!player?.gameStats || player.gameStats.length === 0) {
      return [];
    }

    if (selectedSeasons.includes('All-Time') && selectedSeasons.length === 1) {
      return player.gameStats;
    }

    // Filter by multiple seasons
    const seasonsToFilter = selectedSeasons.filter(s => s !== 'All-Time');
    const seasonGames = games.filter(g => seasonsToFilter.includes(g.season));
    const seasonGameIds = new Set(seasonGames.map(g => g.id));
    return player.gameStats.filter((gs: any) => seasonGameIds.has(gs.gameId));
  };

  const stats = player?.stats || {};
  const seasonGameStats = getSeasonGameStats();

  // Calculate season-specific stats from filtered game stats
  const calculateSeasonStats = () => {
    if (seasonGameStats.length === 0) {
      return {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fieldGoalsMade: 0,
        fieldGoalsAttempted: 0,
        fieldGoalPercentage: 0,
        threePointersMade: 0,
        threePointersAttempted: 0,
        threePointPercentage: 0,
        freeThrowsMade: 0,
        freeThrowsAttempted: 0,
        freeThrowPercentage: 0,
        fouls: 0,
        minutesPlayed: 0,
        efficiency: 0,
      };
    }

    const gamesPlayed = seasonGameStats.length;
    const wins = seasonGameStats.filter((g: any) => g.result === 'W').length;
    const losses = seasonGameStats.filter((g: any) => g.result === 'L').length;

    const totals = seasonGameStats.reduce((acc: any, game: any) => ({
      points: acc.points + (game.points || 0),
      rebounds: acc.rebounds + (game.rebounds || 0),
      assists: acc.assists + (game.assists || 0),
      steals: acc.steals + (game.steals || 0),
      blocks: acc.blocks + (game.blocks || 0),
      turnovers: acc.turnovers + (game.turnovers || 0),
      fieldGoalsMade: acc.fieldGoalsMade + (game.fieldGoalsMade || 0),
      fieldGoalsAttempted: acc.fieldGoalsAttempted + (game.fieldGoalsAttempted || 0),
      threePointersMade: acc.threePointersMade + (game.threePointersMade || 0),
      threePointersAttempted: acc.threePointersAttempted + (game.threePointersAttempted || 0),
      freeThrowsMade: acc.freeThrowsMade + (game.freeThrowsMade || 0),
      freeThrowsAttempted: acc.freeThrowsAttempted + (game.freeThrowsAttempted || 0),
      fouls: acc.fouls + (game.fouls || 0),
      minutesPlayed: acc.minutesPlayed + (game.minutesPlayed || 0),
    }), {
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      threePointersMade: 0,
      threePointersAttempted: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      fouls: 0,
      minutesPlayed: 0,
    });

    const missedFG = totals.fieldGoalsAttempted - totals.fieldGoalsMade;
    const missedFT = totals.freeThrowsAttempted - totals.freeThrowsMade;
    const efficiency = gamesPlayed > 0 
      ? (totals.points + totals.rebounds + totals.assists + totals.steals + totals.blocks - missedFG - missedFT - totals.turnovers) / gamesPlayed
      : 0;

    return {
      gamesPlayed,
      wins,
      losses,
      points: gamesPlayed > 0 ? totals.points / gamesPlayed : 0,
      rebounds: gamesPlayed > 0 ? totals.rebounds / gamesPlayed : 0,
      assists: gamesPlayed > 0 ? totals.assists / gamesPlayed : 0,
      steals: gamesPlayed > 0 ? totals.steals / gamesPlayed : 0,
      blocks: gamesPlayed > 0 ? totals.blocks / gamesPlayed : 0,
      turnovers: gamesPlayed > 0 ? totals.turnovers / gamesPlayed : 0,
      fieldGoalsMade: totals.fieldGoalsMade,
      fieldGoalsAttempted: totals.fieldGoalsAttempted,
      fieldGoalPercentage: totals.fieldGoalsAttempted > 0 ? (totals.fieldGoalsMade / totals.fieldGoalsAttempted * 100) : 0,
      threePointersMade: totals.threePointersMade,
      threePointersAttempted: totals.threePointersAttempted,
      threePointPercentage: totals.threePointersAttempted > 0 ? (totals.threePointersMade / totals.threePointersAttempted * 100) : 0,
      freeThrowsMade: totals.freeThrowsMade,
      freeThrowsAttempted: totals.freeThrowsAttempted,
      freeThrowPercentage: totals.freeThrowsAttempted > 0 ? (totals.freeThrowsMade / totals.freeThrowsAttempted * 100) : 0,
      fouls: gamesPlayed > 0 ? totals.fouls / gamesPlayed : 0,
      minutesPlayed: gamesPlayed > 0 ? totals.minutesPlayed / gamesPlayed : 0,
      efficiency,
    };
  };

  const seasonStats = calculateSeasonStats();
  const winPercentage = seasonStats.gamesPlayed > 0 ? (seasonStats.wins / seasonStats.gamesPlayed * 100).toFixed(1) : '0.0';

  // Calculate career totals from ALL game stats (not filtered by season)
  const totals = player?.gameStats?.reduce((acc: any, game: any) => ({
    points: acc.points + (game.points || 0),
    rebounds: acc.rebounds + (game.rebounds || 0),
    assists: acc.assists + (game.assists || 0),
    steals: acc.steals + (game.steals || 0),
    blocks: acc.blocks + (game.blocks || 0),
    turnovers: acc.turnovers + (game.turnovers || 0),
    fieldGoalsMade: acc.fieldGoalsMade + (game.fieldGoalsMade || 0),
    fieldGoalsAttempted: acc.fieldGoalsAttempted + (game.fieldGoalsAttempted || 0),
    threePointersMade: acc.threePointersMade + (game.threePointersMade || 0),
    threePointersAttempted: acc.threePointersAttempted + (game.threePointersAttempted || 0),
    freeThrowsMade: acc.freeThrowsMade + (game.freeThrowsMade || 0),
    freeThrowsAttempted: acc.freeThrowsAttempted + (game.freeThrowsAttempted || 0),
    fouls: acc.fouls + (game.fouls || 0),
    minutesPlayed: acc.minutesPlayed + (game.minutesPlayed || 0),
  }), {
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
    fouls: 0,
    minutesPlayed: 0,
  }) || {
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
    fouls: 0,
    minutesPlayed: 0,
  };
  
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Team-colored Banner */}
      {team && (
        <div 
          className="rounded-t-lg h-32 mb-[-4rem] relative z-0"
          style={{ 
            background: `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary} 100%)` 
          }}
        />
      )}
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 shadow-sm relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 sm:space-y-4 md:space-y-0 md:space-x-4 lg:space-x-6">
          {/* Profile Picture */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border-4 border-white dark:border-gray-800">
            {player.profilePicture && !imageError ? (
              <img
                src={player.profilePicture}
                alt={player.displayName}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <User className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white break-words">{player.displayName}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">@{player.robloxUsername}</p>
            
            {player.description && (
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">{player.description}</p>
            )}

            {/* Team */}
            {team && (
              <Link
                href="/branding"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg mb-4"
                style={{
                  backgroundColor: `${team.colors.primary}20`,
                  color: team.colors.primary,
                }}
              >
                <span className="font-semibold">{team.name}</span>
              </Link>
            )}

            {/* Roles */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
              {player.roles.map((role: string) => (
                <div
                  key={role}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  {getRoleIcon(role)}
                  <span>{role}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Edit Profile Button */}
        {isOwnProfile && (
          <div className="mt-6 flex justify-center md:justify-end">
            <EditProfile
              player={player}
              isOwnProfile={isOwnProfile}
              onSave={handleProfileUpdate}
            />
          </div>
        )}
      </div>

      {/* Season Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Viewing Stats For:</h3>
            <MultiSeasonSelector
              availableSeasons={availableSeasons.map(s => ({
                id: s.id,
                name: s.name,
                isCurrent: s.isCurrent
              }))}
              selectedSeasons={selectedSeasons}
              onChange={setSelectedSeasons}
              accentColor="#00A8E8"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Career totals are always shown for all seasons combined
          </div>
        </div>
      </div>

      {/* Record */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">Record</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-eba-blue">{seasonStats.gamesPlayed}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Games Played</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-green-500">{seasonStats.wins}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Wins</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-red-500">{seasonStats.losses}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Losses</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-eba-blue">{winPercentage}%</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Win %</div>
          </div>
        </div>
      </div>

      {/* Averages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">Averages</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
          <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{seasonStats.points.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">PTS</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{seasonStats.rebounds.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">REB</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{seasonStats.assists.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">AST</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{seasonStats.steals.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">STL</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{seasonStats.blocks.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">BLK</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{seasonStats.turnovers.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">TOV</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{seasonStats.minutesPlayed.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">MIN</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{seasonStats.efficiency.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">EFF</div>
          </div>
        </div>
      </div>

      {/* Shooting Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Shooting Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Field Goals */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-center text-gray-900 dark:text-white">Field Goals</h3>
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-eba-blue">
                {seasonStats.fieldGoalPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">FG%</div>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {seasonStats.fieldGoalsMade} / {seasonStats.fieldGoalsAttempted}
              <div className="text-xs">FGM / FGA</div>
            </div>
          </div>

          {/* Three Pointers */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-center text-gray-900 dark:text-white">Three Pointers</h3>
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-eba-blue">
                {seasonStats.threePointPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">3P%</div>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {seasonStats.threePointersMade} / {seasonStats.threePointersAttempted}
              <div className="text-xs">3PM / 3PA</div>
            </div>
          </div>

          {/* Free Throws */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-center text-gray-900 dark:text-white">Free Throws</h3>
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-eba-blue">
                {seasonStats.freeThrowPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">FT%</div>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {seasonStats.freeThrowsMade} / {seasonStats.freeThrowsAttempted}
              <div className="text-xs">FTM / FTA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Totals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Career Totals</h2>
        
        {/* Main Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Main Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totals.points}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">PTS</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totals.rebounds}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">REB</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totals.assists}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">AST</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totals.steals}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">STL</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totals.blocks}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">BLK</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totals.turnovers}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">TOV</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totals.fouls}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">FLS</div>
            </div>
          </div>
        </div>

        {/* Shooting Totals */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Shooting Totals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{totals.fieldGoalsMade}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">FGM</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{totals.fieldGoalsAttempted}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">FGA</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{totals.threePointersMade}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">3PM</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{totals.threePointersAttempted}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">3PA</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{totals.freeThrowsMade}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">FTM</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{totals.freeThrowsAttempted}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">FTA</div>
            </div>
          </div>
        </div>

        {/* Minutes Played */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Playing Time</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 bg-gradient-to-br from-eba-blue/10 to-eba-blue/20 dark:from-eba-blue/20 dark:to-eba-blue/10 rounded-lg border border-eba-blue/30">
              <div className="text-3xl font-bold text-eba-blue">{totals.minutesPlayed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Minutes</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-eba-blue/10 to-eba-blue/20 dark:from-eba-blue/20 dark:to-eba-blue/10 rounded-lg border border-eba-blue/30">
              <div className="text-3xl font-bold text-eba-blue">{stats?.gamesPlayed > 0 ? (totals.minutesPlayed / stats.gamesPlayed).toFixed(1) : '0.0'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Minutes Per Game</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Advanced Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{seasonStats.fouls.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">FLS (Fouls)</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {seasonStats.turnovers > 0 ? (seasonStats.assists / seasonStats.turnovers).toFixed(1) : seasonStats.assists.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">ATOr</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {/* Using player's assist percentage from their stats */}
              {(stats?.assistPercentage || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">AST%</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {seasonStats.efficiency.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">EFF</div>
          </div>
        </div>
      </div>

      {/* Recent Games */}
      {seasonGameStats && seasonGameStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Recent Games {!(selectedSeasons.includes('All-Time') && selectedSeasons.length === 1) && `(${selectedSeasons.filter(s => s !== 'All-Time').join(', ')})`}
          </h2>
          <div className="space-y-3">
            {seasonGameStats
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((game: any) => (
                <Link
                  key={game.id}
                  href={`/games/${game.gameId}`}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded font-bold ${
                      game.result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {game.result}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">vs {game.opponent}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(game.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{game.points}</div>
                      <div className="text-xs text-gray-500">PTS</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{game.rebounds}</div>
                      <div className="text-xs text-gray-500">REB</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{game.assists}</div>
                      <div className="text-xs text-gray-500">AST</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{game.steals}</div>
                      <div className="text-xs text-gray-500">STL</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{game.blocks}</div>
                      <div className="text-xs text-gray-500">BLK</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {game.fieldGoalsMade}/{game.fieldGoalsAttempted}
                      </div>
                      <div className="text-xs text-gray-500">FG</div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
