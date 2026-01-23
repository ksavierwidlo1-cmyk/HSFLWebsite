'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, TrendingUp, Award } from 'lucide-react';

interface TeamStanding {
  team: any;
  wins: number;
  losses: number;
  winPercentage: number;
  pointDifferential: number;
  pointsFor: number;
  pointsAgainst: number;
}

const TIER_COLORS = {
  S: 'from-yellow-500 to-amber-600',
  A: 'from-gray-300 to-gray-400',
  B: 'from-orange-600 to-orange-700',
  C: 'from-gray-500 to-gray-600',
};

const TIER_TEXT_COLORS = {
  S: 'text-yellow-500',
  A: 'text-gray-400',
  B: 'text-orange-600',
  C: 'text-gray-500',
};

export default function ElevateRankingsPage() {
  const [selectedSeason, setSelectedSeason] = useState<string>('All-Time');
  const [availableSeasons, setAvailableSeasons] = useState<string[]>(['All-Time']);
  const [teams, setTeams] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const res = await fetch('/api/seasons');
      if (res.ok) {
        const seasons = await res.json();
        const seasonNames = seasons.map((s: any) => s.name);
        
        // Always include All-Time
        if (!seasonNames.includes('All-Time')) {
          seasonNames.push('All-Time');
        }
        
        setAvailableSeasons(seasonNames);
        
        // Set current season as default
        const currentSeason = seasons.find((s: any) => s.isCurrent);
        if (currentSeason) {
          setSelectedSeason(currentSeason.name);
        }
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [teamsRes, gamesRes] = await Promise.all([
        fetch('/api/elevate/teams'),
        fetch('/api/elevate/games')
      ]);
      const [teamsData, gamesData] = await Promise.all([
        teamsRes.json(),
        gamesRes.json()
      ]);
      setTeams(teamsData);
      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate standings for each team
  const calculateStandings = (seasonFilter?: string): TeamStanding[] => {
    return teams.map(team => {
      // Get all completed games for this team
      let teamGames = games.filter(
        g => (g.homeTeamId === team.id || g.awayTeamId === team.id) && g.status === 'completed'
      );

      // Filter by season if not "All-Time"
      if (seasonFilter && seasonFilter !== 'All-Time') {
        teamGames = teamGames.filter(game => game.season === seasonFilter);
      }

      let wins = 0;
      let losses = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;

      teamGames.forEach(game => {
        const isHome = game.homeTeamId === team.id;
        const teamScore = isHome ? (game.homeScore || 0) : (game.awayScore || 0);
        const opponentScore = isHome ? (game.awayScore || 0) : (game.homeScore || 0);

        pointsFor += teamScore;
        pointsAgainst += opponentScore;

        // Check if this is a forfeit game
        let teamWon = false;
        if (game.isForfeit && game.forfeitWinner) {
          teamWon = (isHome && game.forfeitWinner === 'home') || (!isHome && game.forfeitWinner === 'away');
        } else {
          teamWon = teamScore > opponentScore;
        }

        if (teamWon) {
          wins++;
        } else {
          losses++;
        }
      });

      const gamesPlayed = wins + losses;
      const winPercentage = gamesPlayed > 0 ? wins / gamesPlayed : 0;

      return {
        team,
        wins,
        losses,
        winPercentage,
        pointDifferential: pointsFor - pointsAgainst,
        pointsFor,
        pointsAgainst,
      };
    });
  };

  const getStandings = () => {
    const standings = calculateStandings(selectedSeason);
    
    // Sort by wins (descending), then by losses (ascending), then by point differential (descending)
    return standings.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return b.pointDifferential - a.pointDifferential;
    });
  };

  const standings = getStandings();
  
  // Divide teams into tiers
  const teamsPerTier = Math.ceil(standings.length / 4);
  const tiers = {
    S: standings.slice(0, teamsPerTier),
    A: standings.slice(teamsPerTier, teamsPerTier * 2),
    B: standings.slice(teamsPerTier * 2, teamsPerTier * 3),
    C: standings.slice(teamsPerTier * 3),
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">Loading rankings...</div>
        </div>
      </main>
    );
  }

  const renderTier = (tierName: 'S' | 'A' | 'B' | 'C', tierTeams: TeamStanding[], startRank: number) => (
    <div className="mb-8" key={tierName}>
      <div className={`bg-gradient-to-r ${TIER_COLORS[tierName]} p-4 rounded-t-lg`}>
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Award className="w-6 h-6 mr-2" />
          Tier {tierName}
        </h2>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Record
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Win %
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pts For
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pts Against
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Diff
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tierTeams.map((standing, index) => {
                const rank = startRank + index;
                return (
                  <tr key={standing.team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-2xl font-bold ${TIER_TEXT_COLORS[tierName]}`}>
                        {rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/elevate/teams/${standing.team.id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ backgroundColor: standing.team.colors.primary }}
                        >
                          {standing.team.logo ? (
                            <Image
                              src={standing.team.logo}
                              alt={standing.team.name}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            <span
                              className="text-xl font-bold"
                              style={{ color: standing.team.colors.secondary }}
                            >
                              {standing.team.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-gray-900 dark:text-white">
                            {standing.team.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {standing.team.conference} Conference
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {standing.wins}-{standing.losses}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900 dark:text-white">
                      {(standing.winPercentage * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900 dark:text-white">
                      {standing.pointsFor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900 dark:text-white">
                      {standing.pointsAgainst}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`font-semibold ${
                          standing.pointDifferential > 0
                            ? 'text-green-600 dark:text-green-400'
                            : standing.pointDifferential < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {standing.pointDifferential > 0 ? '+' : ''}
                        {standing.pointDifferential}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Team Rankings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Teams ranked by performance and divided into tiers
          </p>
        </div>

        {/* Season Filter */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-xs">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 text-center">
              Select Season
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none text-gray-900 dark:text-white shadow-sm"
              style={{ focusBorderColor: '#8cd2fe' }}
            >
              {availableSeasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tiers */}
        <div className="max-w-6xl mx-auto">
          {renderTier('S', tiers.S, 1)}
          {renderTier('A', tiers.A, tiers.S.length + 1)}
          {renderTier('B', tiers.B, tiers.S.length + tiers.A.length + 1)}
          {renderTier('C', tiers.C, tiers.S.length + tiers.A.length + tiers.B.length + 1)}
        </div>
      </div>
    </main>
  );
}
