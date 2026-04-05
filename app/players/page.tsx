'use client';

import { Search, User, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const ALL_POSITIONS = ['C', 'OG', 'OT', 'QB', 'RB', 'WR', 'TE', 'K', 'CB', 'LB', 'DT', 'DE', 'S'];

// Returns the most important stat labels for a given primary position
function getPositionStats(player: any): { label: string; value: string }[] {
  const gs = player.gameStats || [];
  const gp = gs.length;
  if (gp === 0) return [];

  const sum = (f: string) => gs.reduce((a: number, g: any) => a + (Number(g[f]) || 0), 0);
  const pos = (player.positions || [])[0] || '';

  if (pos === 'QB') {
    const att = sum('passAttempts');
    const comp = sum('completions');
    const yds = sum('passingYards');
    const td = sum('passingTDs');
    return [
      { label: 'YDS/G', value: (yds / gp).toFixed(1) },
      { label: 'TD', value: String(td) },
      { label: 'PCT', value: att > 0 ? ((comp / att) * 100).toFixed(1) + '%' : '—' },
    ];
  }
  if (pos === 'RB') {
    const yds = sum('rushingYards'); const td = sum('rushingTDs');
    return [
      { label: 'YDS/G', value: (yds / gp).toFixed(1) },
      { label: 'TD', value: String(td) },
      { label: 'GP', value: String(gp) },
    ];
  }
  if (['WR', 'TE'].includes(pos)) {
    const yds = sum('receivingYards'); const rec = sum('receptions'); const td = sum('receivingTDs');
    return [
      { label: 'REC/G', value: (rec / gp).toFixed(1) },
      { label: 'YDS/G', value: (yds / gp).toFixed(1) },
      { label: 'TD', value: String(td) },
    ];
  }
  if (['CB', 'LB', 'DT', 'DE', 'S'].includes(pos)) {
    const tkl = sum('tackles'); const sck = sum('defensiveSacks'); const int = sum('defInterceptions');
    return [
      { label: 'TKL/G', value: (tkl / gp).toFixed(1) },
      { label: 'SCK', value: String(sck) },
      { label: 'INT', value: String(int) },
    ];
  }
  if (pos === 'K') {
    const fgm = sum('fieldGoalsMade'); const fga = sum('fieldGoalsAttempted');
    return [
      { label: 'FGM', value: String(fgm) },
      { label: 'FGA', value: String(fga) },
      { label: 'FG%', value: fga > 0 ? ((fgm / fga) * 100).toFixed(1) + '%' : '—' },
    ];
  }
  // OL / default
  return [{ label: 'GP', value: String(gp) }];
}

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');

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
    const matchesSearch = player.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.robloxUsername.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTeam = true;
    if (selectedTeamId === 'free-agent') {
      matchesTeam = !player.teamId;
    } else if (selectedTeamId !== 'all') {
      matchesTeam = player.teamId === selectedTeamId;
    }

    let matchesPosition = true;
    if (selectedPosition !== 'all') {
      matchesPosition = Array.isArray(player.positions) && player.positions.includes(selectedPosition);
    }
    
    return matchesSearch && matchesTeam && matchesPosition;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 flex items-center text-gray-900 dark:text-white">
          <Search className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-hsfl-blue" />
          Player Search
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or Roblox username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-hsfl-blue transition-colors text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Team filter */}
          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-hsfl-blue transition-colors text-gray-900 dark:text-white"
            >
              <option value="all">All Teams</option>
              <option value="free-agent">Eligible Athletes</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          {/* Position filter */}
          <div className="flex-1 min-w-[140px]">
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-hsfl-blue transition-colors text-gray-900 dark:text-white"
            >
              <option value="all">All Positions</option>
              {ALL_POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* Active filter chips */}
          {(selectedTeamId !== 'all' || selectedPosition !== 'all' || searchQuery) && (
            <button
              onClick={() => { setSelectedTeamId('all'); setSelectedPosition('all'); setSearchQuery(''); }}
              className="px-3 py-2.5 text-xs font-semibold text-hsfl-blue border border-hsfl-blue rounded-lg hover:bg-hsfl-blue hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Player Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => {
            const team = teams.find(t => t.id === player.teamId);
            const posStats = getPositionStats(player);
            const hasPositions = Array.isArray(player.positions) && player.positions.length > 0;

            return (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-hsfl-blue hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card top: team color accent */}
                <div
                  className="h-1.5"
                  style={{ backgroundColor: team ? team.colors.primary : '#1872de' }}
                />

                <div className="p-4">
                  {/* Photo + name row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700 group-hover:border-hsfl-blue transition-colors">
                      {player.profilePicture && !imageErrors.has(player.id) ? (
                        <img
                          src={player.profilePicture}
                          alt={player.displayName}
                          className="w-full h-full object-cover"
                          onError={() => setImageErrors(prev => new Set(Array.from(prev).concat(player.id)))}
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm truncate text-gray-900 dark:text-white group-hover:text-hsfl-blue transition-colors">
                          {player.displayName}
                        </h3>
                      </div>
                      {player.starRating > 0 && (
                        <div className="flex items-center gap-px mt-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-sm leading-none ${s <= player.starRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>★</span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{player.robloxUsername}</p>
                    </div>
                  </div>

                  {/* Position badge + team */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {hasPositions && (
                      <span className="px-2 py-0.5 bg-hsfl-blue text-white text-xs font-bold rounded uppercase tracking-wide">
                        {player.positions.join('/')}
                      </span>
                    )}
                    {team && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ backgroundColor: `${team.colors.primary}22`, color: team.colors.primary }}
                      >
                        {team.name}
                      </span>
                    )}
                    {!team && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">
                        Eligible Athlete
                      </span>
                    )}
                  </div>

                  {/* Position-relevant stats */}
                  {posStats.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1 pt-3 border-t border-gray-100 dark:border-gray-800">
                      {posStats.map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                          <div className="font-bold text-sm text-gray-900 dark:text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-center text-gray-400 dark:text-gray-600">
                      No stats recorded
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full bg-white dark:bg-gray-900 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            <User className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No players found</p>
            <p className="text-sm mt-1 text-gray-400">
              {searchQuery || selectedTeamId !== 'all' || selectedPosition !== 'all'
                ? 'Try adjusting your filters'
                : 'Players will appear here once added'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
