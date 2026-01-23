'use client';

import { Trophy, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Elevate302GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'completed' | 'scheduled'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamesRes, teamsRes] = await Promise.all([
        fetch('/api/elevate/games'),
        fetch('/api/elevate/teams')
      ]);
      const [gamesData, teamsData] = await Promise.all([
        gamesRes.json(),
        teamsRes.json()
      ]);
      setGames(gamesData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  const filteredGames = games.filter(game => {
    if (filter === 'all') return true;
    return game.status === filter;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center space-x-4">
        <Image 
          src="/elevate302.png" 
          alt="Elevate 302" 
          width={60} 
          height={60}
          className="rounded-lg"
        />
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#8cd2fe' }}>Games Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400">View all Elevate 302 games</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }`}
          style={filter === 'all' ? { backgroundColor: '#8cd2fe' } : {}}
        >
          All Games
        </button>
        <button
          onClick={() => setFilter('live')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filter === 'live'
              ? 'bg-red-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }`}
        >
          Live
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('scheduled')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filter === 'scheduled'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }`}
        >
          Scheduled
        </button>
      </div>

      {/* Games List */}
      <div className="space-y-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => {
            const homeTeam = getTeam(game.homeTeamId);
            const awayTeam = getTeam(game.awayTeamId);

            if (!homeTeam || !awayTeam) return null;

            return (
              <Link
                key={game.id}
                href={`/elevate/games/${game.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-[#8cd2fe] dark:hover:border-[#8cd2fe] transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(game.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    game.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
                    game.status === 'completed' ? 'bg-green-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {game.status === 'live' ? '● LIVE' : game.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Away Team */}
                  <div className="flex-1 flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
                      style={{
                        backgroundColor: awayTeam.colors.primary,
                        color: awayTeam.colors.secondary,
                      }}
                    >
                      {awayTeam.name.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{awayTeam.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Away</div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="px-8 text-center">
                    {game.status === 'completed' || game.status === 'live' ? (
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold" style={{ color: '#8cd2fe' }}>{game.awayScore}</div>
                        <div className="text-2xl font-bold text-gray-400">-</div>
                        <div className="text-3xl font-bold" style={{ color: '#8cd2fe' }}>{game.homeScore}</div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-400">VS</div>
                    )}
                  </div>

                  {/* Home Team */}
                  <div className="flex-1 flex items-center justify-end space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">{homeTeam.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Home</div>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
                      style={{
                        backgroundColor: homeTeam.colors.primary,
                        color: homeTeam.colors.secondary,
                      }}
                    >
                      {homeTeam.name.substring(0, 3).toUpperCase()}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No games found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
