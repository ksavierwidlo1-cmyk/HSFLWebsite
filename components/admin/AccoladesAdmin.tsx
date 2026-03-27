'use client';

import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit2, Trash2, UserPlus } from 'lucide-react';

export default function AccoladesAdmin() {
  const [activeTab, setActiveTab] = useState<'accolades' | 'assignments'>('accolades');
  const [accolades, setAccolades] = useState<any[]>([]);
  const [playerAccolades, setPlayerAccolades] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Accolade form state
  const [showAccoladeForm, setShowAccoladeForm] = useState(false);
  const [editingAccolade, setEditingAccolade] = useState<any>(null);
  const [accoladeName, setAccoladeName] = useState('');
  const [accoladeAbbr, setAccoladeAbbr] = useState('');
  const [accoladeDesc, setAccoladeDesc] = useState('');
  const [accoladeOrder, setAccoladeOrder] = useState('0');

  // Assignment form state
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedAccolade, setSelectedAccolade] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedSeasonName, setSelectedSeasonName] = useState('');

  useEffect(() => {
    fetchAccolades();
    fetchPlayerAccolades();
    fetchPlayers();
    fetchSeasons();
  }, []);

  const fetchAccolades = async () => {
    try {
      const response = await fetch('/api/accolades');
      const data = await response.json();
      setAccolades(data);
    } catch (error) {
      console.error('Failed to fetch accolades:', error);
    }
  };

  const fetchPlayerAccolades = async () => {
    try {
      const response = await fetch('/api/player-accolades');
      const data = await response.json();
      setPlayerAccolades(data);
    } catch (error) {
      console.error('Failed to fetch player accolades:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/seasons');
      const data = await response.json();
      setSeasons(data);
    } catch (error) {
      console.error('Failed to fetch seasons:', error);
    }
  };

  const handleCreateAccolade = async () => {
    if (!accoladeName || !accoladeAbbr) {
      alert('Name and abbreviation are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/accolades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accoladeName,
          abbreviation: accoladeAbbr,
          description: accoladeDesc,
          displayOrder: parseInt(accoladeOrder) || 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Accolade created successfully!');
        await fetchAccolades();
        resetAccoladeForm();
      } else {
        alert(data.error || 'Failed to create accolade');
      }
    } catch (error) {
      alert('Failed to create accolade');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccolade = async () => {
    if (!editingAccolade) return;

    setLoading(true);
    try {
      const response = await fetch('/api/accolades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAccolade.id,
          name: accoladeName,
          abbreviation: accoladeAbbr,
          description: accoladeDesc,
          displayOrder: parseInt(accoladeOrder) || 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Accolade updated successfully!');
        await fetchAccolades();
        resetAccoladeForm();
      } else {
        alert(data.error || 'Failed to update accolade');
      }
    } catch (error) {
      alert('Failed to update accolade');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccolade = async (accoladeId: string) => {
    if (!confirm('Are you sure you want to delete this accolade?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/accolades?id=${accoladeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Accolade deleted successfully!');
        await fetchAccolades();
      } else {
        alert(data.error || 'Failed to delete accolade');
      }
    } catch (error) {
      alert('Failed to delete accolade');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAccolade = async () => {
    if (!selectedPlayer || !selectedAccolade || !selectedSeasonName) {
      alert('Please select player, accolade, and season');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/player-accolades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayer,
          accoladeId: selectedAccolade,
          seasonId: selectedSeason || null,
          seasonName: selectedSeasonName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Accolade assigned successfully!');
        await fetchPlayerAccolades();
        resetAssignmentForm();
      } else {
        alert(data.error || 'Failed to assign accolade');
      }
    } catch (error) {
      alert('Failed to assign accolade');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlayerAccolade = async (playerAccoladeId: string) => {
    if (!confirm('Are you sure you want to remove this accolade from the player?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/player-accolades?id=${playerAccoladeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Accolade removed successfully!');
        await fetchPlayerAccolades();
      } else {
        alert(data.error || 'Failed to remove accolade');
      }
    } catch (error) {
      alert('Failed to remove accolade');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetAccoladeForm = () => {
    setAccoladeName('');
    setAccoladeAbbr('');
    setAccoladeDesc('');
    setAccoladeOrder('0');
    setShowAccoladeForm(false);
    setEditingAccolade(null);
  };

  const resetAssignmentForm = () => {
    setSelectedPlayer('');
    setSelectedAccolade('');
    setSelectedSeason('');
    setSelectedSeasonName('');
    setShowAssignmentForm(false);
  };

  const openEditAccoladeForm = (accolade: any) => {
    setEditingAccolade(accolade);
    setAccoladeName(accolade.name);
    setAccoladeAbbr(accolade.abbreviation);
    setAccoladeDesc(accolade.description || '');
    setAccoladeOrder(accolade.display_order?.toString() || '0');
    setShowAccoladeForm(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Accolades Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create accolades and assign them to players
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('accolades')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'accolades'
              ? 'border-eba-blue text-eba-blue'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Accolades</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'assignments'
              ? 'border-eba-blue text-eba-blue'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Player Assignments</span>
          </div>
        </button>
      </div>

      {/* Accolades Tab */}
      {activeTab === 'accolades' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAccoladeForm(!showAccoladeForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-eba-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Accolade</span>
            </button>
          </div>

          {/* Accolade Form */}
          {showAccoladeForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {editingAccolade ? 'Edit Accolade' : 'Create New Accolade'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={accoladeName}
                    onChange={(e) => setAccoladeName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue text-gray-900 dark:text-white"
                    placeholder="e.g., Most Valuable Player"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Abbreviation *
                  </label>
                  <input
                    type="text"
                    value={accoladeAbbr}
                    onChange={(e) => setAccoladeAbbr(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue text-gray-900 dark:text-white"
                    placeholder="e.g., MVP"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={accoladeDesc}
                    onChange={(e) => setAccoladeDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue text-gray-900 dark:text-white"
                    placeholder="Brief description of this accolade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={accoladeOrder}
                    onChange={(e) => setAccoladeOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={editingAccolade ? handleUpdateAccolade : handleCreateAccolade}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingAccolade ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={resetAccoladeForm}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Accolades List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Abbreviation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {accolades.map((accolade) => (
                  <tr key={accolade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {accolade.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {accolade.abbreviation}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {accolade.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button
                        onClick={() => openEditAccoladeForm(accolade)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccolade(accolade.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAssignmentForm(!showAssignmentForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-eba-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>Assign Accolade</span>
            </button>
          </div>

          {/* Assignment Form */}
          {showAssignmentForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Assign Accolade to Player
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Player *
                  </label>
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue text-gray-900 dark:text-white"
                  >
                    <option value="">Select Player</option>
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.displayName} (@{player.robloxUsername})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Accolade *
                  </label>
                  <select
                    value={selectedAccolade}
                    onChange={(e) => setSelectedAccolade(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue text-gray-900 dark:text-white"
                  >
                    <option value="">Select Accolade</option>
                    {accolades.map((accolade) => (
                      <option key={accolade.id} value={accolade.id}>
                        {accolade.name} ({accolade.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Season *
                  </label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(e.target.value);
                      const season = seasons.find(s => s.id === e.target.value);
                      setSelectedSeasonName(season?.name || '');
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue text-gray-900 dark:text-white"
                  >
                    <option value="">Select Season</option>
                    {seasons.map((season) => (
                      <option key={season.id} value={season.id}>
                        {season.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleAssignAccolade}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Assign'}
                </button>
                <button
                  onClick={resetAssignmentForm}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Player Accolades List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Accolade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Season
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Awarded Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {playerAccolades.map((pa) => (
                  <tr key={pa.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {pa.player?.display_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {pa.accolade?.name || 'Unknown'} ({pa.accolade?.abbreviation})
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {pa.season_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(pa.awarded_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => handleRemovePlayerAccolade(pa.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
