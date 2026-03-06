'use client';

import { User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Elevate302PlayerProfilePage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchData();
    setImageError(false); // Reset image error when player changes
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        fetch('/api/elevate/players'),
        fetch('/api/elevate/teams')
      ]);
      const [playersData, teamsData] = await Promise.all([
        playersRes.json(),
        teamsRes.json()
      ]);
      
      const currentPlayer = playersData.find((p: any) => p.id === params.id);
      if (!currentPlayer) {
        notFound();
      }
      
      setPlayer(currentPlayer);
      setTeam(teamsData.find((t: any) => t.id === currentPlayer.teamId));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const stats = player.stats;
  const wins = player.gameStats?.filter((g: any) => g.result === 'W').length || 0;
  const losses = player.gameStats?.filter((g: any) => g.result === 'L').length || 0;
  const winPercentage = stats.gamesPlayed > 0 ? (wins / stats.gamesPlayed * 100).toFixed(1) : '0.0';

  const totals = player.gameStats?.reduce((acc: any, game: any) => ({
    points: acc.points + (game.points || 0),
    rebounds: acc.rebounds + (game.rebounds || 0),
    assists: acc.assists + (game.assists || 0),
    steals: acc.steals + (game.steals || 0),
    blocks: acc.blocks + (game.blocks || 0),
    turnovers: acc.turnovers + (game.turnovers || 0),
    minutesPlayed: acc.minutesPlayed + (game.minutesPlayed || 0),
  }), {
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    minutesPlayed: 0,
  }) || {
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    minutesPlayed: 0,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 mb-6 shadow-sm relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border-4 border-white dark:border-gray-800">
            {player.profilePicture && !imageError ? (
              <img
                src={player.profilePicture}
                alt={player.displayName}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <Image src="/elevate302.png" alt="Elevate 302" width={32} height={32} className="rounded" />
              <h1 className="text-4xl font-bold" style={{ color: '#8cd2fe' }}>{player.displayName}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">@{player.robloxUsername}</p>
            
            {player.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">{player.description}</p>
            )}

            {team && (
              <Link
                href="/elevate/branding"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg mb-4"
                style={{
                  backgroundColor: `${team.colors.primary}20`,
                  color: team.colors.primary,
                }}
              >
                <span className="font-semibold">{team.name}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Record */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#8cd2fe' }}>Record</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-3xl font-bold" style={{ color: '#8cd2fe' }}>{stats.gamesPlayed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Games Played</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-3xl font-bold text-green-500">{wins}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Wins</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-3xl font-bold text-red-500">{losses}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Losses</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-3xl font-bold" style={{ color: '#8cd2fe' }}>{winPercentage}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Win %</div>
          </div>
        </div>
      </div>

      {/* Averages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#8cd2fe' }}>Averages</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.points.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">PTS</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rebounds.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">REB</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.assists.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">AST</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.steals.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">STL</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.blocks.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">BLK</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.turnovers.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">TOV</div>
          </div>
        </div>
      </div>

      {/* Career Totals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#8cd2fe' }}>Career Totals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold" style={{ color: '#8cd2fe' }}>{totals.points}</div>
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
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totals.minutesPlayed}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">MIN</div>
          </div>
        </div>
      </div>
    </div>
  );
}
