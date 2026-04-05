'use client';

import { Trophy, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import MultiSeasonSelector from '@/components/MultiSeasonSelector';

// ── Category definitions ─────────────────────────────────────────────────────

type StatCategory =
  | 'passing' | 'rushing' | 'receiving' | 'blocking'
  | 'defense' | 'runDefense' | 'passRush' | 'passCoverage'
  | 'kicking' | 'returning';
type StatMode = 'averages' | 'totals';
type SortDirection = 'desc' | 'asc';

const CATEGORY_LABELS: Record<StatCategory, string> = {
  passing: 'Passing', rushing: 'Rushing', receiving: 'Receiving',
  blocking: 'Blocking', defense: 'Defense', runDefense: 'Run Defense',
  passRush: 'Pass Rush', passCoverage: 'Pass Coverage',
  kicking: 'Kicking', returning: 'Returning',
};

interface ColDef { key: string; label: string; tooltip: string; alwaysRate?: boolean; }

const COLS: Record<StatCategory, ColDef[]> = {
  passing: [
    { key: 'completions',   label: 'COMP', tooltip: 'Completions' },
    { key: 'passAttempts',  label: 'ATT',  tooltip: 'Pass Attempts' },
    { key: 'completionPct', label: 'PCT',  tooltip: 'Completion %', alwaysRate: true },
    { key: 'passingYards',  label: 'YDS',  tooltip: 'Passing Yards' },
    { key: 'passingTDs',    label: 'TD',   tooltip: 'Passing Touchdowns' },
    { key: 'interceptions', label: 'INT',  tooltip: 'Interceptions Thrown' },
    { key: 'passerRating',  label: 'RATE', tooltip: 'Passer Rating', alwaysRate: true },
    { key: 'passeFumbles',  label: 'FUM',  tooltip: 'Fumbles' },
    { key: 'sacksTaken',    label: 'SCK',  tooltip: 'Times Sacked' },
  ],
  rushing: [
    { key: 'rushAttempts',  label: 'ATT', tooltip: 'Rushing Attempts' },
    { key: 'rushingYards',  label: 'YDS', tooltip: 'Rushing Yards' },
    { key: 'rushingTDs',    label: 'TD',  tooltip: 'Rushing Touchdowns' },
    { key: 'rushFumbles',   label: 'FUM', tooltip: 'Fumbles' },
  ],
  receiving: [
    { key: 'receptions',    label: 'REC', tooltip: 'Receptions' },
    { key: 'targets',       label: 'TGT', tooltip: 'Targets' },
    { key: 'catchPct',      label: 'PCT', tooltip: 'Catch Rate (REC/TGT)', alwaysRate: true },
    { key: 'receivingYards',label: 'YDS', tooltip: 'Receiving Yards' },
    { key: 'receivingTDs',  label: 'TD',  tooltip: 'Receiving Touchdowns' },
    { key: 'recFumbles',    label: 'FUM', tooltip: 'Fumbles' },
  ],
  blocking: [
    { key: 'snaps',         label: 'SNPS', tooltip: 'Snaps Played' },
    { key: 'sacksAllowed',  label: 'SCKA', tooltip: 'Sacks Allowed' },
  ],
  defense: [
    { key: 'tackles',           label: 'TKL',  tooltip: 'Tackles' },
    { key: 'tacklesForLoss',    label: 'TFL',  tooltip: 'Tackles For Loss' },
    { key: 'defensiveSacks',    label: 'SCK',  tooltip: 'Sacks' },
    { key: 'hurries',           label: 'HUR',  tooltip: 'Hurries' },
    { key: 'safeties',          label: 'SFTY', tooltip: 'Safeties' },
    { key: 'defInterceptions',  label: 'INT',  tooltip: 'Interceptions' },
    { key: 'passBreakups',      label: 'PBU',  tooltip: 'Pass Breakups' },
    { key: 'receptionsAllowed', label: 'RECA', tooltip: 'Receptions Allowed' },
    { key: 'targetsDefended',   label: 'TGT',  tooltip: 'Targets Defended' },
    { key: 'yardsAllowed',      label: 'YDSA', tooltip: 'Yards Allowed' },
    { key: 'touchdownsAllowed', label: 'TDA',  tooltip: 'Touchdowns Allowed' },
    { key: 'defensiveTDs',      label: 'TD',   tooltip: 'Defensive Touchdowns' },
    { key: 'forcedFumbles',     label: 'FF',   tooltip: 'Forced Fumbles' },
    { key: 'fumbleRecoveries',  label: 'FR',   tooltip: 'Fumble Recoveries' },
  ],
  runDefense: [
    { key: 'tackles',        label: 'TKL', tooltip: 'Tackles' },
    { key: 'tacklesForLoss', label: 'TFL', tooltip: 'Tackles For Loss' },
  ],
  passRush: [
    { key: 'defensiveSacks', label: 'SCK',  tooltip: 'Sacks' },
    { key: 'hurries',        label: 'HUR',  tooltip: 'Hurries' },
    { key: 'safeties',       label: 'SFTY', tooltip: 'Safeties' },
  ],
  passCoverage: [
    { key: 'defInterceptions',  label: 'INT',  tooltip: 'Interceptions' },
    { key: 'passBreakups',      label: 'PBU',  tooltip: 'Pass Breakups' },
    { key: 'receptionsAllowed', label: 'RECA', tooltip: 'Receptions Allowed' },
    { key: 'targetsDefended',   label: 'TGT',  tooltip: 'Targets Defended' },
    { key: 'yardsAllowed',      label: 'YDSA', tooltip: 'Yards Allowed' },
    { key: 'touchdownsAllowed', label: 'TDA',  tooltip: 'Touchdowns Allowed' },
  ],
  kicking: [
    { key: 'extraPointsMade',       label: 'XPM',   tooltip: 'Extra Points Made' },
    { key: 'extraPointsAttempted',  label: 'XPA',   tooltip: 'Extra Points Attempted' },
    { key: 'xpPct',                 label: 'XPPCT', tooltip: 'XP %', alwaysRate: true },
    { key: 'fieldGoalsMade',        label: 'FGM',   tooltip: 'Field Goals Made' },
    { key: 'fieldGoalsAttempted',   label: 'FGA',   tooltip: 'Field Goals Attempted' },
    { key: 'fgPct',                 label: 'FGPCT', tooltip: 'FG %', alwaysRate: true },
  ],
  returning: [
    { key: 'returns',       label: 'RET', tooltip: 'Returns' },
    { key: 'returnYards',   label: 'YDS', tooltip: 'Return Yards' },
    { key: 'returnTDs',     label: 'TD',  tooltip: 'Return Touchdowns' },
    { key: 'returnFumbles', label: 'FUM', tooltip: 'Fumbles' },
  ],
};

const DEFAULT_SORT: Record<StatCategory, string> = {
  passing: 'passingYards', rushing: 'rushingYards', receiving: 'receivingYards',
  blocking: 'snaps', defense: 'tackles', runDefense: 'tackles',
  passRush: 'defensiveSacks', passCoverage: 'defInterceptions',
  kicking: 'fgPct', returning: 'returnYards',
};

// ── Passer Rating formula ────────────────────────────────────────────────────

function calcPasserRating(comp: number, att: number, yds: number, td: number, int: number): number {
  if (att === 0) return 0;
  const cap = (v: number) => Math.min(2.375, Math.max(0, v));
  const a = cap(((comp / att) - 0.3) * 5);
  const b = cap(((yds  / att) - 3)   * 0.25);
  const c = cap((td    / att)         * 20);
  const d = cap(2.375 - ((int / att)  * 25));
  return ((a + b + c + d) / 6) * 100;
}

// ── Main component ───────────────────────────────────────────────────────────

export default function StatsPage() {
  const [category, setCategory]           = useState<StatCategory>('passing');
  const [sortColumn, setSortColumn]       = useState<string>(DEFAULT_SORT['passing']);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statMode, setStatMode]           = useState<StatMode>('averages');
  const [selectedSeasons, setSelectedSeasons]     = useState<string[]>(['All-Time']);
  const [availableSeasons, setAvailableSeasons]   = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [teams,   setTeams]   = useState<any[]>([]);
  const [games,   setGames]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 25;

  useEffect(() => { fetchData(); fetchSeasons(); }, []);

  const fetchSeasons = async () => {
    try {
      const res = await fetch('/api/seasons');
      if (!res.ok) return;
      const seasons = await res.json();
      setAvailableSeasons(seasons);
      const cur = seasons.find((s: any) => s.isCurrent);
      setSelectedSeasons(cur ? [cur.name] : seasons.length > 0 ? [seasons[0].name] : ['All-Time']);
    } catch {}
  };

  const fetchData = async () => {
    try {
      const [pR, tR, gR] = await Promise.all([fetch('/api/players'), fetch('/api/teams'), fetch('/api/games')]);
      const [pd, td, gd] = await Promise.all([pR.json(), tR.json(), gR.json()]);
      setPlayers(pd); setTeams(td); setGames(gd);
    } catch {}
    finally { setLoading(false); }
  };

  const getTeam = (id: string) => teams.find(t => t.id === id) ?? null;

  const getFilteredGS = (player: any): any[] => {
    if (!player.gameStats?.length) return [];
    if (selectedSeasons.includes('All-Time') && selectedSeasons.length === 1) return player.gameStats;
    const toFilter = selectedSeasons.filter(s => s !== 'All-Time');
    const ids = new Set(games.filter(g => toFilter.includes(g.season)).map(g => g.id));
    return player.gameStats.filter((gs: any) => ids.has(gs.gameId));
  };

  const sum = (gs: any[], field: string) => gs.reduce((a, g) => a + (Number(g[field]) || 0), 0);

  const calcStats = (player: any) => {
    const gs = getFilteredGS(player);
    const gp = gs.length;
    const v = (total: number) => statMode === 'totals' || gp === 0 ? total : total / gp;

    const completions   = sum(gs, 'completions');
    const passAttempts  = sum(gs, 'passAttempts');
    const passingYards  = sum(gs, 'passingYards');
    const passingTDs    = sum(gs, 'passingTDs');
    const interceptions = sum(gs, 'interceptions');
    const passeFumbles  = sum(gs, 'passeFumbles');
    const sacksTaken    = sum(gs, 'sacksTaken');

    const rushAttempts  = sum(gs, 'rushAttempts');
    const rushingYards  = sum(gs, 'rushingYards');
    const rushingTDs    = sum(gs, 'rushingTDs');
    const rushFumbles   = sum(gs, 'rushFumbles');

    const receptions     = sum(gs, 'receptions');
    const targets        = sum(gs, 'targets');
    const receivingYards = sum(gs, 'receivingYards');
    const receivingTDs   = sum(gs, 'receivingTDs');
    const recFumbles     = sum(gs, 'recFumbles');

    const snaps        = sum(gs, 'snaps');
    const sacksAllowed = sum(gs, 'sacksAllowed');

    const tackles           = sum(gs, 'tackles');
    const tacklesForLoss    = sum(gs, 'tacklesForLoss');
    const defensiveSacks    = sum(gs, 'defensiveSacks');
    const hurries           = sum(gs, 'hurries');
    const safeties          = sum(gs, 'safeties');
    const defInterceptions  = sum(gs, 'defInterceptions');
    const passBreakups      = sum(gs, 'passBreakups');
    const receptionsAllowed = sum(gs, 'receptionsAllowed');
    const targetsDefended   = sum(gs, 'targetsDefended');
    const yardsAllowed      = sum(gs, 'yardsAllowed');
    const touchdownsAllowed = sum(gs, 'touchdownsAllowed');
    const defensiveTDs      = sum(gs, 'defensiveTDs');
    const forcedFumbles     = sum(gs, 'forcedFumbles');
    const fumbleRecoveries  = sum(gs, 'fumbleRecoveries');

    const fieldGoalsMade       = sum(gs, 'fieldGoalsMade');
    const fieldGoalsAttempted  = sum(gs, 'fieldGoalsAttempted');
    const extraPointsMade      = sum(gs, 'extraPointsMade');
    const extraPointsAttempted = sum(gs, 'extraPointsAttempted');

    const returns       = sum(gs, 'returns');
    const returnYards   = sum(gs, 'returnYards');
    const returnTDs     = sum(gs, 'returnTDs');
    const returnFumbles = sum(gs, 'returnFumbles');

    return {
      gp,
      completions:   v(completions),   passAttempts:  v(passAttempts),
      passingYards:  v(passingYards),  passingTDs:    v(passingTDs),
      interceptions: v(interceptions), passeFumbles:  v(passeFumbles),
      sacksTaken:    v(sacksTaken),
      completionPct: passAttempts > 0 ? (completions / passAttempts) * 100 : 0,
      passerRating:  calcPasserRating(completions, passAttempts, passingYards, passingTDs, interceptions),

      rushAttempts: v(rushAttempts), rushingYards: v(rushingYards),
      rushingTDs:   v(rushingTDs),   rushFumbles:  v(rushFumbles),

      receptions:    v(receptions),    targets:       v(targets),
      receivingYards:v(receivingYards),receivingTDs:  v(receivingTDs),
      recFumbles:    v(recFumbles),
      catchPct: targets > 0 ? (receptions / targets) * 100 : 0,

      snaps: v(snaps), sacksAllowed: v(sacksAllowed),

      tackles:           v(tackles),           tacklesForLoss:    v(tacklesForLoss),
      defensiveSacks:    v(defensiveSacks),     hurries:           v(hurries),
      safeties:          v(safeties),           defInterceptions:  v(defInterceptions),
      passBreakups:      v(passBreakups),       receptionsAllowed: v(receptionsAllowed),
      targetsDefended:   v(targetsDefended),    yardsAllowed:      v(yardsAllowed),
      touchdownsAllowed: v(touchdownsAllowed),  defensiveTDs:      v(defensiveTDs),
      forcedFumbles:     v(forcedFumbles),      fumbleRecoveries:  v(fumbleRecoveries),

      fieldGoalsMade:       v(fieldGoalsMade),       fieldGoalsAttempted:  v(fieldGoalsAttempted),
      extraPointsMade:      v(extraPointsMade),       extraPointsAttempted: v(extraPointsAttempted),
      fgPct: fieldGoalsAttempted > 0 ? (fieldGoalsMade  / fieldGoalsAttempted)  * 100 : 0,
      xpPct: extraPointsAttempted > 0 ? (extraPointsMade / extraPointsAttempted) * 100 : 0,

      returns:       v(returns),       returnYards:   v(returnYards),
      returnTDs:     v(returnTDs),     returnFumbles: v(returnFumbles),
    };
  };

  const handleCategoryChange = (cat: StatCategory) => {
    setCategory(cat);
    setSortColumn(DEFAULT_SORT[cat]);
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const handleSort = (col: string) => {
    if (sortColumn === col) setSortDirection(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortColumn(col); setSortDirection('desc'); }
    setCurrentPage(1);
  };

  const allLeaders = [...players]
    .map(p => ({ ...p, _s: calcStats(p) }))
    .filter(p => p._s.gp > 0)
    .sort((a, b) => {
      const av = (a._s as any)[sortColumn] ?? 0;
      const bv = (b._s as any)[sortColumn] ?? 0;
      return sortDirection === 'desc' ? bv - av : av - bv;
    });

  const totalPages  = Math.ceil(allLeaders.length / PER_PAGE);
  const startIndex  = (currentPage - 1) * PER_PAGE;
  const leaders     = allLeaders.slice(startIndex, startIndex + PER_PAGE);
  const cols        = COLS[category];

  const fmt = (val: number, key: string) => {
    const col = cols.find(c => c.key === key);
    if (col?.alwaysRate) return val.toFixed(1) + (key !== 'passerRating' ? '%' : '');
    return statMode === 'averages' ? val.toFixed(1) : Math.round(val).toString();
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center text-gray-600 dark:text-gray-400">Loading stats...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center text-gray-900 dark:text-white">
          <Trophy className="w-10 h-10 mr-3 text-hsfl-blue" />
          League Leaders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Top performers in the High School Football League</p>
      </div>

      {/* Category Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as StatCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              category === cat
                ? 'bg-hsfl-blue text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Season(s):</label>
          <MultiSeasonSelector
            availableSeasons={availableSeasons.map(s => ({ id: s.id, name: s.name, isCurrent: s.isCurrent }))}
            selectedSeasons={selectedSeasons}
            onChange={v => { setSelectedSeasons(v); setCurrentPage(1); }}
            accentColor="#1872de"
          />
        </div>
        <div className="flex items-center space-x-2">
          {(['averages', 'totals'] as StatMode[]).map(mode => (
            <button key={mode} onClick={() => setStatMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statMode === mode
                  ? 'bg-hsfl-blue text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pagination info */}
      {allLeaders.length > 0 && (
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}–{Math.min(startIndex + PER_PAGE, allLeaders.length)} of {allLeaders.length} players
          </span>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50">Prev</button>
              <span className="text-sm text-gray-600 dark:text-gray-400">{currentPage}/{totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">#</th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Name</th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Team</th>
                <th className="px-3 py-4 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">POS</th>
                <th onClick={() => handleSort('gp')}
                  className="px-3 py-4 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 select-none">
                  <div className="flex items-center justify-center gap-1">GP
                    {sortColumn === 'gp' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                {cols.map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} title={col.tooltip}
                    className="px-3 py-4 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 select-none whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">{col.label}
                      {sortColumn === col.key && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaders.length > 0 ? leaders.map((player, idx) => {
                const rank = startIndex + idx + 1;
                const team = getTeam(player.teamId);
                const posDisplay = Array.isArray(player.positions) && player.positions.length > 0
                  ? player.positions.join('/') : '—';
                return (
                  <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                        {rank === 2 && <Trophy className="w-4 h-4 text-gray-400" />}
                        {rank === 3 && <Trophy className="w-4 h-4 text-amber-600" />}
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{rank}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Link href={`/players/${player.id}`} className="flex items-center space-x-2 hover:opacity-80">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {player.profilePicture
                            ? <img src={player.profilePicture} alt={player.displayName} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">{player.displayName.charAt(0).toUpperCase()}</div>}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{player.displayName}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {team ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0" style={{ backgroundColor: team.colors.primary }}>
                            {team.logo
                              ? <Image src={team.logo} alt={team.name} width={20} height={20} className="object-cover" />
                              : <span className="text-xs font-bold flex items-center justify-center h-full" style={{ color: team.colors.secondary }}>{team.name.charAt(0)}</span>}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{team.abbreviation || team.name.substring(0, 3).toUpperCase()}</span>
                        </div>
                      ) : <span className="text-xs text-gray-400">EA</span>}
                    </td>
                    <td className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">{posDisplay}</td>
                    <td className={`px-3 py-3 text-center text-sm ${sortColumn === 'gp' ? 'font-bold text-hsfl-blue' : 'text-gray-900 dark:text-white'}`}>
                      {player._s.gp}
                    </td>
                    {cols.map(col => (
                      <td key={col.key} className={`px-3 py-3 text-center text-sm whitespace-nowrap ${sortColumn === col.key ? 'font-bold text-hsfl-blue' : 'text-gray-900 dark:text-white'}`}>
                        {fmt((player._s as any)[col.key] ?? 0, col.key)}
                      </td>
                    ))}
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6 + cols.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No player statistics available yet.</p>
                    <p className="text-sm mt-1">Stats will appear once games are played!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {allLeaders.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50">Prev</button>
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
