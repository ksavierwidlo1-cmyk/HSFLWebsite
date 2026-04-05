'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddGameStatsModalProps {
  playerId: string;
  playerTeamId: string;
  playerName: string;
  onClose: () => void;
  onSave: (gameStats: any) => void;
}

export default function AddGameStatsModal({ playerId, playerTeamId, playerName, onClose, onSave }: AddGameStatsModalProps) {
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [opponent, setOpponent] = useState('');
  const [result, setResult] = useState<'W' | 'L'>('W');
  const [date, setDate] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    completions: '0', passAttempts: '0', passingYards: '0', passingTDs: '0',
    interceptions: '0', passeFumbles: '0', sacksTaken: '0',
    rushAttempts: '0', rushingYards: '0', rushingTDs: '0', rushFumbles: '0',
    receptions: '0', targets: '0', receivingYards: '0', receivingTDs: '0', recFumbles: '0',
    snaps: '0', sacksAllowed: '0',
    tackles: '0', tacklesForLoss: '0', defensiveSacks: '0', hurries: '0', safeties: '0',
    defInterceptions: '0', passBreakups: '0', receptionsAllowed: '0', targetsDefended: '0',
    yardsAllowed: '0', touchdownsAllowed: '0', defensiveTDs: '0', forcedFumbles: '0', fumbleRecoveries: '0',
    fieldGoalsMade: '0', fieldGoalsAttempted: '0', extraPointsMade: '0', extraPointsAttempted: '0',
    returns: '0', returnYards: '0', returnTDs: '0', returnFumbles: '0',
  });
  const setStat = (k: string, v: string) => setStats(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    fetchGames();
    fetchTeams();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
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

  // Games involving the player's team, sorted newest first
  const playerGames = playerTeamId
    ? games.filter(g => g.homeTeamId === playerTeamId || g.awayTeamId === playerTeamId)
    : games;

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    if (!gameId) return;
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    // Auto-fill date
    setDate(game.scheduledDate.split('T')[0]);

    // Auto-fill opponent name
    const opponentTeamId = game.homeTeamId === playerTeamId ? game.awayTeamId : game.homeTeamId;
    const opponentTeam = teams.find(t => t.id === opponentTeamId);
    setOpponent(opponentTeam?.name || '');

    // Auto-fill result from score if game is completed
    if (game.status === 'completed' && game.homeScore != null && game.awayScore != null) {
      const isHome = game.homeTeamId === playerTeamId;
      const myScore = isHome ? game.homeScore : game.awayScore;
      const theirScore = isHome ? game.awayScore : game.homeScore;
      setResult(myScore >= theirScore ? 'W' : 'L');
    }
  };

  const handleSave = () => {
    const n = (k: string) => Number(stats[k as keyof typeof stats]) || 0;
    const gameStats = {
      id: Date.now().toString(),
      playerId,
      gameId: selectedGameId || `game-${Date.now()}`,
      date: date || new Date().toISOString(),
      opponent,
      result,
      completions: n('completions'), passAttempts: n('passAttempts'), passingYards: n('passingYards'),
      passingTDs: n('passingTDs'), interceptions: n('interceptions'), passeFumbles: n('passeFumbles'),
      sacksTaken: n('sacksTaken'),
      rushAttempts: n('rushAttempts'), rushingYards: n('rushingYards'), rushingTDs: n('rushingTDs'),
      rushFumbles: n('rushFumbles'),
      receptions: n('receptions'), targets: n('targets'), receivingYards: n('receivingYards'),
      receivingTDs: n('receivingTDs'), recFumbles: n('recFumbles'),
      snaps: n('snaps'), sacksAllowed: n('sacksAllowed'),
      tackles: n('tackles'), tacklesForLoss: n('tacklesForLoss'), defensiveSacks: n('defensiveSacks'),
      hurries: n('hurries'), safeties: n('safeties'), defInterceptions: n('defInterceptions'),
      passBreakups: n('passBreakups'), receptionsAllowed: n('receptionsAllowed'),
      targetsDefended: n('targetsDefended'), yardsAllowed: n('yardsAllowed'),
      touchdownsAllowed: n('touchdownsAllowed'), defensiveTDs: n('defensiveTDs'),
      forcedFumbles: n('forcedFumbles'), fumbleRecoveries: n('fumbleRecoveries'),
      fieldGoalsMade: n('fieldGoalsMade'), fieldGoalsAttempted: n('fieldGoalsAttempted'),
      extraPointsMade: n('extraPointsMade'), extraPointsAttempted: n('extraPointsAttempted'),
      returns: n('returns'), returnYards: n('returnYards'), returnTDs: n('returnTDs'),
      returnFumbles: n('returnFumbles'),
    };

    onSave(gameStats);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Game Stats for {playerName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Game Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Select Game
            </label>
            <select
              value={selectedGameId}
              onChange={(e) => handleGameSelect(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white"
            >
              <option value="">— Manual Entry —</option>
              {playerGames.map(game => {
                const opponentTeamId = game.homeTeamId === playerTeamId ? game.awayTeamId : game.homeTeamId;
                const opponentTeam = teams.find(t => t.id === opponentTeamId);
                const label = `${new Date(game.scheduledDate).toLocaleDateString()} vs ${opponentTeam?.name || 'Unknown'} (${game.status})`;
                return <option key={game.id} value={game.id}>{label}</option>;
              })}
            </select>
            {selectedGameId && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Date, opponent, and result auto-filled from game
              </p>
            )}
          </div>

          {/* Date / Opponent / Result — shown only for manual entry */}
          {!selectedGameId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Opponent *</label>
                <input
                  type="text"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  placeholder="Opponent team name"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Result *</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value as 'W' | 'L')}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-hsfl-blue text-gray-900 dark:text-white"
                >
                  <option value="W">Win</option>
                  <option value="L">Loss</option>
                </select>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="space-y-5 mb-6">
            {(() => {
              const N = ({ k, label }: { k: string; label: string }) => (
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</label>
                  <input type="number" value={stats[k as keyof typeof stats]} onChange={e => setStat(k, e.target.value)} min="0"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white" />
                </div>
              );
              return (
                <>
                  <div><h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Passing</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <N k="completions" label="Completions" /><N k="passAttempts" label="Attempts" />
                      <N k="passingYards" label="Passing Yards" /><N k="passingTDs" label="Passing TDs" />
                      <N k="interceptions" label="Interceptions" /><N k="passeFumbles" label="Fumbles" />
                      <N k="sacksTaken" label="Times Sacked" />
                    </div>
                  </div>
                  <div><h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Rushing</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <N k="rushAttempts" label="Attempts" /><N k="rushingYards" label="Rushing Yards" />
                      <N k="rushingTDs" label="Rushing TDs" /><N k="rushFumbles" label="Fumbles" />
                    </div>
                  </div>
                  <div><h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Receiving</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <N k="receptions" label="Receptions" /><N k="targets" label="Targets" />
                      <N k="receivingYards" label="Rec. Yards" /><N k="receivingTDs" label="Rec. TDs" />
                      <N k="recFumbles" label="Fumbles" />
                    </div>
                  </div>
                  <div><h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Blocking</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <N k="snaps" label="Snaps" /><N k="sacksAllowed" label="Sacks Allowed" />
                    </div>
                  </div>
                  <div><h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Defense</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <N k="tackles" label="Tackles" /><N k="tacklesForLoss" label="TFL" />
                      <N k="defensiveSacks" label="Sacks" /><N k="hurries" label="Hurries" />
                      <N k="safeties" label="Safeties" /><N k="defInterceptions" label="INT" />
                      <N k="passBreakups" label="Pass Breakups" /><N k="receptionsAllowed" label="Rec. Allowed" />
                      <N k="targetsDefended" label="Targets Def." /><N k="yardsAllowed" label="Yards Allowed" />
                      <N k="touchdownsAllowed" label="TDs Allowed" /><N k="defensiveTDs" label="Def. TDs" />
                      <N k="forcedFumbles" label="Forced Fumbles" /><N k="fumbleRecoveries" label="Fumble Rec." />
                    </div>
                  </div>
                  <div><h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Kicking</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <N k="fieldGoalsMade" label="FG Made" /><N k="fieldGoalsAttempted" label="FG Attempted" />
                      <N k="extraPointsMade" label="XP Made" /><N k="extraPointsAttempted" label="XP Attempted" />
                    </div>
                  </div>
                  <div><h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Returning</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <N k="returns" label="Returns" /><N k="returnYards" label="Return Yards" />
                      <N k="returnTDs" label="Return TDs" /><N k="returnFumbles" label="Fumbles" />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-hsfl-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Add Game Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
