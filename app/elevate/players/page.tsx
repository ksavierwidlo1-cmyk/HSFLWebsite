'use client';

import { Search, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Elevate302PlayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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
      setPlayers(playersData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.robloxUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <Image 
          src="/elevate302.png" 
          alt="Elevate 302" 
          width={48} 
          height={48}
          className="rounded-lg w-12 h-12 sm:w-14 sm:h-14 md:w-[60px] md:h-[60px]"
        />
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center" style={{ color: '#8cd2fe' }}>
            <Search className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-2 sm:mr-3" />
            Player Search
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Find and view Elevate 302 player profiles</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by display name or Roblox username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none transition-colors text-gray-900 dark:text-white shadow-sm"
            style={{ borderColor: searchQuery ? '#8cd2fe' : '' }}
          />
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => {
            const team = teams.find(t => t.id === player.teamId);
            
            return (
              <Link
                key={player.id}
                href={`/elevate/players/${player.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700 hover:border-[#8cd2fe] dark:hover:border-[#8cd2fe] transition-all transform hover:scale-105 shadow-sm"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {player.profilePicture ? (
                      <img
                        src={player.profilePicture}
                        alt={player.displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                        }}
                      />
                    ) : (
                      <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg truncate text-gray-900 dark:text-white">{player.displayName}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">@{player.robloxUsername}</p>
                  </div>
                </div>

                {/* Team Badge */}
                {team && (
                  <div className="mb-3">
                    <div
                      className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${team.colors.primary}20`,
                        color: team.colors.primary,
                      }}
                    >
                      <span>{team.name}</span>
                    </div>
                  </div>
                )}

                {/* Roles */}
                {player.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {player.roles.slice(0, 3).map((role: string) => (
                      <span
                        key={role}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ backgroundColor: '#8cd2fe', color: '#0A0E27' }}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: '#8cd2fe' }}>{player.stats.points.toFixed(1)}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">PPG</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: '#8cd2fe' }}>{player.stats.rebounds.toFixed(1)}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">RPG</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: '#8cd2fe' }}>{player.stats.assists.toFixed(1)}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">APG</div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No players found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
