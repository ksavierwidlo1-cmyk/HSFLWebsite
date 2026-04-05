'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, UserPlus, TrendingUp } from 'lucide-react';
import AddGameStatsModal from './AddGameStatsModal';

export default function PlayersAdmin() {
  const [showImportForm, setShowImportForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('');
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGameStatsModal, setShowGameStatsModal] = useState(false);
  const [gameStatsPlayer, setGameStatsPlayer] = useState<any>(null);

  // Form state
  const [robloxUsername, setRobloxUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [teamId, setTeamId] = useState('');
  const [roles, setRoles] = useState<string[]>(['Player']);
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [positions, setPositions] = useState<string[]>([]);
  const [starRating, setStarRating] = useState(0);
  
  // Search state
  const [teamSearch, setTeamSearch] = useState('');

  // Fetch players and teams on mount
  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.robloxUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.discordUsername && p.discordUsername.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTeam = !teamFilter || 
      (teamFilter === 'FREE_AGENT' ? !p.teamId : p.teamId === teamFilter);
    
    return matchesSearch && matchesTeam;
  });
  
  // Filter teams for dropdown
  const filteredTeams = teams.filter(team =>
    team.name?.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const handleImportPlayer = async () => {
    if (!robloxUsername) {
      alert('Please enter a Roblox username');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robloxUsername,
          discordUsername,
          teamId,
          roles,
          jerseyNumber: jerseyNumber !== '' ? parseInt(jerseyNumber) : null,
          positions,
          starRating,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Player imported successfully!');
        await fetchPlayers();
        resetForm();
      } else {
        alert(data.error || 'Failed to import player');
      }
    } catch (error) {
      alert('Failed to import player');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlayer = async () => {
    if (!selectedPlayer) return;

    setLoading(true);
    try {
      const response = await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPlayer.id,
          robloxUsername,
          displayName,
          discordUsername,
          teamId,
          roles,
          jerseyNumber: jerseyNumber !== '' ? parseInt(jerseyNumber) : null,
          positions,
          starRating,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Player updated successfully!');
        await fetchPlayers();
        resetForm();
      } else {
        alert(data.error || 'Failed to update player');
      }
    } catch (error) {
      alert('Failed to update player');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/players?id=${playerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Player deleted successfully!');
        await fetchPlayers();
      } else {
        alert(data.error || 'Failed to delete player');
      }
    } catch (error) {
      alert('Failed to delete player');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRobloxUsername('');
    setDisplayName('');
    setDiscordUsername('');
    setTeamId('');
    setRoles(['Player']);
    setJerseyNumber('');
    setPositions([]);
    setStarRating(0);
    setTeamSearch('');
    setShowImportForm(false);
    setShowEditForm(false);
    setSelectedPlayer(null);
  };

  const openEditForm = (player: any) => {
    setSelectedPlayer(player);
    setRobloxUsername(player.robloxUsername);
    setDisplayName(player.displayName);
    setDiscordUsername(player.discordUsername || '');
    setTeamId(player.teamId || '');
    setRoles(player.roles || ['Player']);
    setJerseyNumber(player.jerseyNumber != null ? String(player.jerseyNumber) : '');
    setPositions(player.positions || []);
    setStarRating(player.starRating ?? 0);
    setShowEditForm(true);
    setShowImportForm(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Player Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Import players from Roblox, assign teams, and manage roster
          </p>
        </div>
        <button
          onClick={() => {
            if (showImportForm) {
              resetForm();
            } else {
              setShowImportForm(true);
              setShowEditForm(false);
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-hsfl-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Import Player</span>
        </button>
      </div>

      {/* Import/Edit Form */}
      {(showImportForm || showEditForm) && (
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {showEditForm ? 'Edit Player' : 'Import New Player'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Roblox Username *
              </label>
              <input
                type="text"
                value={robloxUsername}
                onChange={(e) => setRobloxUsername(e.target.value)}
                placeholder="Enter Roblox username"
                disabled={showEditForm}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white disabled:opacity-50"
              />
              {!showEditForm && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Display name and profile will be fetched automatically
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Discord Username
              </label>
              <input
                type="text"
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="username#1234"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Team
              </label>
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search teams..."
                className="w-full px-4 py-2 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white"
              />
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white"
              >
                <option value="">Eligible Athlete</option>
                {filteredTeams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff Role Checkbox */}
          <div className="mt-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={roles.includes('Staff')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setRoles([...roles, 'Staff']);
                  } else {
                    setRoles(roles.filter(r => r !== 'Staff'));
                  }
                }}
                className="w-5 h-5 text-hsfl-blue bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-hsfl-blue focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign Staff Role (displays hammer icon on comments and posts)
              </span>
            </label>
          </div>

          {/* Star Rating */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Star Rating — {starRating === 0 ? 'Unrated' : `${starRating} Star${starRating > 1 ? 's' : ''}`}
            </label>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5].map(n => n === 0 ? (
                <button key={0} onClick={() => setStarRating(0)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    starRating === 0
                      ? 'bg-gray-200 dark:bg-gray-600 border-gray-400 text-gray-700 dark:text-gray-200'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                  None
                </button>
              ) : (
                <button key={n} onClick={() => setStarRating(n)} type="button"
                  className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
                  title={`${n} star${n > 1 ? 's' : ''}`}>
                  <span className={n <= starRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>★</span>
                </button>
              ))}
            </div>
          </div>

          {/* Positions */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Position(s) — {positions.length > 0 ? positions.join('/') : 'none selected'}
            </label>
              <div className="grid grid-cols-3 gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg max-h-44 overflow-y-auto">
                {[
                  { abbr: 'C',  name: 'Center' },
                  { abbr: 'OG', name: 'Off. Guard' },
                  { abbr: 'OT', name: 'Off. Tackle' },
                  { abbr: 'QB', name: 'Quarterback' },
                  { abbr: 'RB', name: 'Running Back' },
                  { abbr: 'WR', name: 'Wide Receiver' },
                  { abbr: 'TE', name: 'Tight End' },
                  { abbr: 'K',  name: 'Kicker' },
                  { abbr: 'CB', name: 'Cornerback' },
                  { abbr: 'LB', name: 'Linebacker' },
                  { abbr: 'DT', name: 'Def. Tackle' },
                  { abbr: 'DE', name: 'Def. End' },
                  { abbr: 'S',  name: 'Safety' },
                ].map(pos => (
                  <label key={pos.abbr} className="flex items-center space-x-1 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-hsfl-blue">
                    <input
                      type="checkbox"
                      checked={positions.includes(pos.abbr)}
                      onChange={(e) => {
                        if (e.target.checked) setPositions([...positions, pos.abbr]);
                        else setPositions(positions.filter(p => p !== pos.abbr));
                      }}
                      className="rounded"
                    />
                    <span className="font-semibold">{pos.abbr}</span>
                    <span className="text-xs text-gray-500">{pos.name}</span>
                  </label>
                ))}
              </div>
          </div>

          <div className="flex space-x-3 mt-6">\n            <button
              onClick={showEditForm ? handleUpdatePlayer : handleImportPlayer}
              disabled={loading}
              className="px-6 py-2 bg-hsfl-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (showEditForm ? 'Update Player' : 'Import Player')}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search players by Roblox or Discord username..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white"
          />
        </div>
        <div className="sm:w-64">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white"
          >
            <option value="">All Teams</option>
            <option value="FREE_AGENT">Eligible Athletes</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-3">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No players found matching your search' : 'No players yet. Import your first player!'}
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-hsfl-blue dark:hover:border-hsfl-blue transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{player.displayName || player.robloxUsername}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">@{player.robloxUsername}</span>
                      {player.discordUsername && (
                        <>
                          <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{player.discordUsername}</span>
                        </>
                      )}
                      {player.teamId && (
                        <>
                          <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {teams.find(t => t.id === player.teamId)?.name || 'Unknown Team'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setGameStatsPlayer(player);
                    setShowGameStatsModal(true);
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Add game stats"
                >
                  <TrendingUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openEditForm(player)}
                  className="p-2 text-hsfl-blue hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit player"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeletePlayer(player.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Delete player"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Game Stats Modal */}
      {showGameStatsModal && gameStatsPlayer && (
        <AddGameStatsModal
          playerId={gameStatsPlayer.id}
          playerTeamId={gameStatsPlayer.teamId || ''}
          playerName={gameStatsPlayer.displayName || gameStatsPlayer.robloxUsername}
          onClose={() => {
            setShowGameStatsModal(false);
            setGameStatsPlayer(null);
          }}
          onSave={async (gameStats) => {
            try {
              const response = await fetch('/api/players/game-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gameStats),
              });

              const data = await response.json();
              
              if (data.success) {
                alert('Game stats added successfully!');
                await fetchPlayers();
                setShowGameStatsModal(false);
                setGameStatsPlayer(null);
              } else {
                alert('Error: ' + data.message);
              }
            } catch (error) {
              console.error('Failed to add game stats:', error);
              alert('Failed to add game stats');
            }
          }}
        />
      )}
    </div>
  );
}
