'use client';

import { Search, User, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams')
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

  const filteredPlayers = players.filter(player => {
    // Search filter
    const matchesSearch = player.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.robloxUsername.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Team filter
    let matchesTeam = true;
    if (selectedTeamId === 'free-agent') {
      matchesTeam = !player.teamId;
    } else if (selectedTeamId !== 'all') {
      matchesTeam = player.teamId === selectedTeamId;
    }
    
    return matchesSearch && matchesTeam;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center text-gray-900 dark:text-white">
          <Search className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-2 sm:mr-3 text-eba-blue" />
          Player Search
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Find and view player profiles</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 sm:mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by display name or Roblox username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue transition-colors text-gray-900 dark:text-white shadow-sm"
          />
        </div>

        {/* Team Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="flex-1 sm:flex-none sm:min-w-[250px] px-4 py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue transition-colors text-gray-900 dark:text-white shadow-sm"
          >
            <option value="all">All Teams</option>
            <option value="free-agent">Free Agents</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
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
                href={`/players/${player.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700 hover:border-eba-blue dark:hover:border-eba-blue transition-all transform hover:scale-105 shadow-sm"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {player.profilePicture && !imageErrors.has(player.id) ? (
                      <img
                        src={player.profilePicture}
                        alt={player.displayName}
                        className="w-full h-full object-cover"
                        onError={() => setImageErrors(prev => new Set(Array.from(prev).concat(player.id)))}
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
                    {player.roles.map((role: string) => (
                      <span
                        key={role}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">PTS</div>
                    <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{player.stats.points.toFixed(1)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">REB</div>
                    <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{player.stats.rebounds.toFixed(1)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400">AST</div>
                    <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{player.stats.assists.toFixed(1)}</div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 shadow-sm">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No players found</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? 'Try a different search term'
                : 'Players will appear here once they are added'}
            </p>
          </div>
        )}
      </div>

      {/* Player Count */}
      {filteredPlayers.length > 0 && (
        <div className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          Showing {filteredPlayers.length} of {players.length} players
        </div>
      )}
    </div>
  );
}
