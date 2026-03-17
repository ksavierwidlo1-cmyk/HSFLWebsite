'use client';

import { Calendar, ChevronRight, Trophy, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ElevateHome() {
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamesRes, teamsRes, playersRes] = await Promise.all([
        fetch('/api/elevate/games'),
        fetch('/api/elevate/teams'),
        fetch('/api/elevate/players')
      ]);
      const [gamesData, teamsData, playersData] = await Promise.all([
        gamesRes.json(),
        teamsRes.json(),
        playersRes.json()
      ]);
      setGames(gamesData);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingGames = games
    .filter(g => g.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  const recentGames = games
    .filter(g => g.status === 'completed')
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
    .slice(0, 3);

  const topPlayers = players
    .filter(p => p.stats && p.stats.gamesPlayed > 0)
    .sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-8 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-5xl font-bold mb-3">Elevate 302</h1>
                <p className="text-xl text-cyan-100 mb-6">
                  Elevate 302 is EBA's official development league where free agents compete in league-run games to showcase their skills and earn a spot on a main roster.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/elevate/branding"
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-cyan-50 transition-colors inline-flex items-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    View Teams
                  </Link>
                  <Link
                    href="/elevate/standings"
                    className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors inline-flex items-center gap-2"
                  >
                    <Trophy className="w-5 h-5" />
                    Standings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Games */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-cyan-500" />
                Recent Games
              </h2>
              <Link
                href="/elevate/games"
                className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentGames.length > 0 ? (
              <div className="space-y-3">
                {recentGames.map((game) => {
                  const homeTeam = teams.find(t => t.id === game.homeTeamId);
                  const awayTeam = teams.find(t => t.id === game.awayTeamId);

                  return (
                    <Link
                      key={game.id}
                      href={`/elevate/games/${game.id}`}
                      className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {awayTeam?.name || 'Unknown'}
                            </span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {game.awayScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {homeTeam?.name || 'Unknown'}
                            </span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {game.homeScore}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(game.scheduledDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            Final
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No recent games
              </p>
            )}
          </div>

          {/* League Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center shadow-sm">
              <div className="text-3xl font-bold text-cyan-600">{teams.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Teams</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center shadow-sm">
              <div className="text-3xl font-bold text-cyan-600">{players.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Players</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center shadow-sm">
              <div className="text-3xl font-bold text-cyan-600">{games.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Games</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center shadow-sm">
              <div className="text-3xl font-bold text-cyan-600">
                {games.filter(g => g.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Games */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Calendar className="w-5 h-5 text-cyan-500" />
              Upcoming Games
            </h2>
            {upcomingGames.length > 0 ? (
              <div className="space-y-3">
                {upcomingGames.map((game) => {
                  const homeTeam = teams.find(t => t.id === game.homeTeamId);
                  const awayTeam = teams.find(t => t.id === game.awayTeamId);

                  return (
                    <Link
                      key={game.id}
                      href={`/elevate/games/${game.id}`}
                      className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {new Date(game.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {awayTeam?.abbreviation || 'TBD'} @ {homeTeam?.abbreviation || 'TBD'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No upcoming games
              </p>
            )}
          </div>

          {/* Top Scorers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              Top Scorers
            </h2>
            {topPlayers.length > 0 ? (
              <div className="space-y-3">
                {topPlayers.map((player, index) => (
                  <Link
                    key={player.id}
                    href={`/elevate/players/${player.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center font-bold text-cyan-600 dark:text-cyan-400">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {player.displayName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {teams.find(t => t.id === player.teamId)?.abbreviation || 'FA'}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-cyan-600">
                      {player.stats?.points?.toFixed(1) || '0.0'}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No player data yet
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/elevate/players"
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white font-medium text-sm"
              >
                Player Directory →
              </Link>
              <Link
                href="/elevate/stats"
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white font-medium text-sm"
              >
                League Stats →
              </Link>
              <Link
                href="/elevate/rankings"
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white font-medium text-sm"
              >
                Power Rankings →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
