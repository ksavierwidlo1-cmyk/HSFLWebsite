'use client';

import { User, Shield, Award, Users as UsersIcon, Hammer, ChevronRight, BarChart2, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import EditProfile from '@/components/EditProfile';
import MultiSeasonSelector from '@/components/MultiSeasonSelector';

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(['All-Time']);
  const [availableSeasons, setAvailableSeasons] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [imageError, setImageError] = useState(false);
  const [playerAccolades, setPlayerAccolades] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'gamelog'>('overview');
  const { data: session } = useSession();

  useEffect(() => {
    fetchData();
    fetchSeasons();
    fetchPlayerAccolades();
    setImageError(false); // Reset image error when player changes
  }, [params.id]);

  const fetchSeasons = async () => {
    try {
      const res = await fetch('/api/seasons');
      if (res.ok) {
        const seasons = await res.json();
        setAvailableSeasons(seasons);
        
        // Set current season as default
        const currentSeason = seasons.find((s: any) => s.isCurrent);
        if (currentSeason) {
          setSelectedSeasons([currentSeason.name]);
        } else if (seasons.length > 0) {
          setSelectedSeasons([seasons[0].name]);
        }
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchPlayerAccolades = async () => {
    try {
      const res = await fetch(`/api/player-accolades?playerId=${params.id}`);
      if (res.ok) {
        const accolades = await res.json();
        setPlayerAccolades(accolades);
      }
    } catch (error) {
      console.error('Error fetching player accolades:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes, gamesRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams'),
        fetch('/api/games')
      ]);
      const [playersData, teamsData, gamesData] = await Promise.all([
        playersRes.json(),
        teamsRes.json(),
        gamesRes.json()
      ]);
      
      const currentPlayer = playersData.find((p: any) => p.id === params.id);
      if (!currentPlayer) {
        notFound();
      }
      
      setPlayer(currentPlayer);
      setTeam(teamsData.find((t: any) => t.id === currentPlayer.teamId));
      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updates: any) => {
    try {
      const response = await fetch(`/api/players/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      // Refresh player data
      await fetchData();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const isOwnProfile = session?.user.playerId === params.id;

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Franchise Owner':
        return <Shield className="w-4 h-4 text-hsfl-blue" />;
      case 'General Manager':
        return <Award className="w-4 h-4 text-hsfl-blue" />;
      case 'Head Coach':
      case 'Assistant Coach':
        return <UsersIcon className="w-4 h-4 text-hsfl-blue" />;
      case 'Staff':
        return <Hammer className="w-4 h-4 text-hsfl-blue" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get season-filtered game stats
  const getSeasonGameStats = () => {
    if (!player?.gameStats || player.gameStats.length === 0) {
      return [];
    }

    if (selectedSeasons.includes('All-Time') && selectedSeasons.length === 1) {
      return player.gameStats;
    }

    // Filter by multiple seasons
    const seasonsToFilter = selectedSeasons.filter(s => s !== 'All-Time');
    const seasonGames = games.filter(g => seasonsToFilter.includes(g.season));
    const seasonGameIds = new Set(seasonGames.map(g => g.id));
    return player.gameStats.filter((gs: any) => seasonGameIds.has(gs.gameId));
  };

  const stats = player?.stats || {};
  const seasonGameStats = getSeasonGameStats();

  // Calculate season-specific stats from filtered game stats
  const calculateSeasonStats = () => {
    const gp = seasonGameStats.length;
    const wins   = seasonGameStats.filter((g: any) => g.result === 'W').length;
    const losses = seasonGameStats.filter((g: any) => g.result === 'L').length;
    const s = (field: string) => seasonGameStats.reduce((a: number, g: any) => a + (Number(g[field]) || 0), 0);

    const completions    = s('completions'),   passAttempts  = s('passAttempts');
    const passingYards   = s('passingYards'),  passingTDs    = s('passingTDs');
    const interceptions  = s('interceptions');
    const rushingYards   = s('rushingYards'),  rushingTDs    = s('rushingTDs'),  rushAttempts = s('rushAttempts');
    const receptions     = s('receptions'),    targets       = s('targets');
    const receivingYards = s('receivingYards'), receivingTDs = s('receivingTDs');
    const tackles        = s('tackles'),        defensiveSacks     = s('defensiveSacks');
    const defInterceptions = s('defInterceptions');
    const fieldGoalsMade = s('fieldGoalsMade'), fieldGoalsAttempted = s('fieldGoalsAttempted');
    const extraPointsMade = s('extraPointsMade'), extraPointsAttempted = s('extraPointsAttempted');
    const returnYards = s('returnYards'), returnTDs = s('returnTDs');

    const capRate = (v: number) => Math.min(2.375, Math.max(0, v));
    const passerRating = passAttempts > 0
      ? ((capRate(((completions/passAttempts)-0.3)*5) + capRate(((passingYards/passAttempts)-3)*0.25)
          + capRate((passingTDs/passAttempts)*20) + capRate(2.375-((interceptions/passAttempts)*25))) / 6) * 100
      : 0;

    return {
      gp, wins, losses,
      passingYards: gp > 0 ? passingYards / gp : 0, passingTDs: gp > 0 ? passingTDs / gp : 0,
      completionPct: passAttempts > 0 ? (completions / passAttempts) * 100 : 0, passerRating,
      passAttempts,
      rushingYards: gp > 0 ? rushingYards / gp : 0, rushingTDs: gp > 0 ? rushingTDs / gp : 0,
      rushAttempts: gp > 0 ? rushAttempts / gp : 0,
      receptions: gp > 0 ? receptions / gp : 0, receivingYards: gp > 0 ? receivingYards / gp : 0,
      receivingTDs: gp > 0 ? receivingTDs / gp : 0,
      catchPct: targets > 0 ? (receptions / targets) * 100 : 0,
      tackles: gp > 0 ? tackles / gp : 0, defensiveSacks: gp > 0 ? defensiveSacks / gp : 0,
      defInterceptions: gp > 0 ? defInterceptions / gp : 0,
      fieldGoalsMade, fieldGoalsAttempted,
      fgPct: fieldGoalsAttempted > 0 ? (fieldGoalsMade / fieldGoalsAttempted) * 100 : 0,
      extraPointsMade, extraPointsAttempted,
      xpPct: extraPointsAttempted > 0 ? (extraPointsMade / extraPointsAttempted) * 100 : 0,
      returnYards: gp > 0 ? returnYards / gp : 0, returnTDs: gp > 0 ? returnTDs / gp : 0,
    };
  };

  const seasonStats = calculateSeasonStats();
  const winPercentage = seasonStats.gp > 0 ? (seasonStats.wins / seasonStats.gp * 100).toFixed(1) : '0.0';

  // Career totals from ALL game stats
  const csf = (field: string) => (player?.gameStats || []).reduce((a: number, g: any) => a + (Number(g[field]) || 0), 0);
  const careerTotals = {
    passingYards: csf('passingYards'), passingTDs: csf('passingTDs'),
    completions: csf('completions'), passAttempts: csf('passAttempts'), interceptions: csf('interceptions'),
    rushingYards: csf('rushingYards'), rushingTDs: csf('rushingTDs'),
    receptions: csf('receptions'), receivingYards: csf('receivingYards'), receivingTDs: csf('receivingTDs'),
    tackles: csf('tackles'), defensiveSacks: csf('defensiveSacks'), defInterceptions: csf('defInterceptions'),
    fieldGoalsMade: csf('fieldGoalsMade'), fieldGoalsAttempted: csf('fieldGoalsAttempted'),
    extraPointsMade: csf('extraPointsMade'), extraPointsAttempted: csf('extraPointsAttempted'),
    returnYards: csf('returnYards'), returnTDs: csf('returnTDs'),
  };
  
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">

      {/* ── HERO BANNER ── */}
      <div
        className="rounded-t-xl overflow-hidden"
        style={{
          background: team
            ? `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary} 100%)`
            : 'linear-gradient(135deg, #1872de 0%, #1460bf 100%)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            {team && (
              <Link href="/branding" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                <span className="font-bold text-sm sm:text-base uppercase tracking-wider">{team.name}</span>
                <span className="hidden sm:inline text-white/60 text-xs">·</span>
                <span className="hidden sm:inline text-white/60 text-xs uppercase">{team.conference}</span>
              </Link>
            )}
            {!team && <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">Eligible Athlete</span>}
          </div>
          <div className="flex items-center gap-1.5 text-white/70 text-xs uppercase tracking-wide">
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Player Profile</span>
          </div>
        </div>
      </div>

      {/* ── PLAYER HEADER CARD ── */}
      <div className="bg-white dark:bg-gray-900 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-xl shadow-md mb-4">
        <div className="flex flex-col sm:flex-row gap-0">

          {/* Photo block */}
          <div className="relative flex-shrink-0">
            <div
              className="w-full sm:w-44 md:w-52 h-44 sm:h-52 md:h-56 flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800 sm:rounded-bl-xl"
              style={team ? { borderBottom: `4px solid ${team.colors.primary}` } : { borderBottom: '4px solid #1872de' }}
            >
              {player.profilePicture && !imageError ? (
                <img src={player.profilePicture} alt={player.displayName}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)} />
              ) : (
                <User className="w-20 h-20 text-gray-300 dark:text-gray-600" />
              )}
            </div>
          </div>

          {/* Name / info */}
          <div className="flex-1 p-4 sm:p-5 md:p-6">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                {player.displayName}
              </h1>
            </div>

            {/* Position + team badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {Array.isArray(player.positions) && player.positions.length > 0 && (
                <span className="px-3 py-1 bg-hsfl-blue text-white font-bold rounded text-sm tracking-widest uppercase">
                  {player.positions.join(' / ')}
                </span>
              )}
              {team && (
                <span
                  className="px-3 py-1 rounded text-sm font-semibold"
                  style={{ backgroundColor: `${team.colors.primary}22`, color: team.colors.primary }}
                >
                  {team.name}
                </span>
              )}
              <span className="text-gray-400 dark:text-gray-500 text-sm">@{player.robloxUsername}</span>
            </div>

            {player.starRating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-2xl leading-none ${s <= player.starRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>★</span>
                ))}
                <span className="ml-1.5 text-sm font-semibold text-yellow-500">{player.starRating}-Star Recruit</span>
              </div>
            )}

            {player.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 max-w-xl">{player.description}</p>
            )}

            {/* Roles */}
            <div className="flex flex-wrap gap-1.5">
              {player.roles.map((role: string) => (
                <div key={role}
                  className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                  {getRoleIcon(role)}
                  <span>{role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-px bg-gray-200 dark:bg-gray-700 sm:border-l border-gray-200 dark:border-gray-700 flex-shrink-0 sm:w-44">
            {[
              { label: 'GP', value: seasonStats.gp, color: 'text-hsfl-blue' },
              { label: 'W', value: seasonStats.wins, color: 'text-green-500' },
              { label: 'L', value: seasonStats.losses, color: 'text-red-500' },
              { label: 'WIN%', value: winPercentage + '%', color: 'text-hsfl-blue' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-3 sm:p-4 last:sm:rounded-br-xl">
                <div className={`text-2xl sm:text-3xl font-black ${color}`}>{value}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-5 bg-white dark:bg-gray-900 rounded-t-lg overflow-hidden">
        {([
          { key: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
          { key: 'stats',    label: 'Statistics', icon: <BarChart2 className="w-4 h-4" /> },
          { key: 'gamelog',  label: 'Game Log',   icon: <Calendar className="w-4 h-4" /> },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'border-hsfl-blue text-hsfl-blue bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">

          {/* Edit Profile */}
          {isOwnProfile && (
            <EditProfile player={player} isOwnProfile={isOwnProfile} onSave={handleProfileUpdate} />
          )}

          {/* Accolades */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <Award className="w-5 h-5 text-yellow-500" />
              <h2 className="font-bold text-gray-900 dark:text-white">Accolades</h2>
              {playerAccolades.length > 0 && (
                <span className="ml-auto text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-semibold">
                  {playerAccolades.length}
                </span>
              )}
            </div>
            {playerAccolades.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-gray-400 dark:text-gray-600">
                <Award className="w-12 h-12 mb-3" />
                <p className="text-sm">No accolades yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {playerAccolades
                  .sort((a, b) => new Date(b.awarded_date).getTime() - new Date(a.awarded_date).getTime())
                  .map(pa => (
                    <div key={pa.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{pa.accolade?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{pa.accolade?.abbreviation}</div>
                      </div>
                      <span className="px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                        {pa.season_name}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Key Stats Snapshot */}
          {seasonStats.gp > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white">Season Highlights</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedSeasons.includes('All-Time') ? 'All-Time' : selectedSeasons.join(', ')} · Per game averages
                </p>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {seasonStats.passAttempts > 0 && [
                  { v: seasonStats.passerRating.toFixed(1), l: 'PASSER RATING' },
                  { v: seasonStats.passingYards.toFixed(1), l: 'PASS YDS/G' },
                  { v: seasonStats.completionPct.toFixed(1) + '%', l: 'COMP%' },
                  { v: seasonStats.passingTDs.toFixed(1), l: 'TD/G' },
                ].map(({ v, l }) => (
                  <div key={l} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-hsfl-blue">{v}</div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wide mt-0.5">{l}</div>
                  </div>
                ))}
                {seasonStats.rushingYards > 0 && [
                  { v: seasonStats.rushingYards.toFixed(1), l: 'RUSH YDS/G' },
                  { v: seasonStats.rushingTDs.toFixed(1), l: 'RUSH TD/G' },
                ].map(({ v, l }) => (
                  <div key={l} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-green-600">{v}</div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wide mt-0.5">{l}</div>
                  </div>
                ))}
                {seasonStats.receptions > 0 && [
                  { v: seasonStats.receptions.toFixed(1), l: 'REC/G' },
                  { v: seasonStats.receivingYards.toFixed(1), l: 'REC YDS/G' },
                ].map(({ v, l }) => (
                  <div key={l} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-purple-600">{v}</div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wide mt-0.5">{l}</div>
                  </div>
                ))}
                {seasonStats.tackles > 0 && [
                  { v: seasonStats.tackles.toFixed(1), l: 'TKL/G' },
                  { v: seasonStats.defensiveSacks.toFixed(1), l: 'SCK/G' },
                ].map(({ v, l }) => (
                  <div key={l} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-red-600">{v}</div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wide mt-0.5">{l}</div>
                  </div>
                ))}
                {seasonStats.fieldGoalsAttempted > 0 && [
                  { v: `${seasonStats.fieldGoalsMade}/${seasonStats.fieldGoalsAttempted}`, l: 'FGM/A' },
                  { v: seasonStats.fgPct.toFixed(1) + '%', l: 'FG%' },
                ].map(({ v, l }) => (
                  <div key={l} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-yellow-600">{v}</div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wide mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STATISTICS TAB ── */}
      {activeTab === 'stats' && (
        <div className="space-y-5">

          {/* Season selector */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Viewing Season:</span>
              <MultiSeasonSelector
                availableSeasons={availableSeasons.map(s => ({ id: s.id, name: s.name, isCurrent: s.isCurrent }))}
                selectedSeasons={selectedSeasons}
                onChange={setSelectedSeasons}
                accentColor="#1872de"
              />
            </div>
          </div>

          {seasonStats.gp === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 text-center text-gray-500">
              No stats recorded for the selected season(s).
            </div>
          ) : (
            <>
              {/* Passing */}
              {seasonStats.passAttempts > 0 && (
                <StatTable title="Passing" color="blue" rows={[
                  { label: 'GP',    value: seasonStats.gp },
                  { label: 'COMP',  value: careerTotals.completions },
                  { label: 'ATT',   value: careerTotals.passAttempts },
                  { label: 'PCT',   value: seasonStats.completionPct.toFixed(1) + '%' },
                  { label: 'YDS',   value: careerTotals.passingYards },
                  { label: 'TD',    value: careerTotals.passingTDs },
                  { label: 'INT',   value: careerTotals.interceptions },
                  { label: 'RATE',  value: seasonStats.passerRating.toFixed(1) },
                  { label: 'YDS/G', value: seasonStats.passingYards.toFixed(1) },
                ]} />
              )}
              {/* Rushing */}
              {seasonStats.rushAttempts > 0 && (
                <StatTable title="Rushing" color="green" rows={[
                  { label: 'GP',    value: seasonStats.gp },
                  { label: 'ATT',   value: careerTotals.rushingYards },
                  { label: 'YDS',   value: careerTotals.rushingYards },
                  { label: 'TD',    value: careerTotals.rushingTDs },
                  { label: 'YDS/G', value: seasonStats.rushingYards.toFixed(1) },
                  { label: 'ATT/G', value: seasonStats.rushAttempts.toFixed(1) },
                ]} />
              )}
              {/* Receiving */}
              {seasonStats.receptions > 0 && (
                <StatTable title="Receiving" color="purple" rows={[
                  { label: 'GP',    value: seasonStats.gp },
                  { label: 'REC',   value: careerTotals.receptions },
                  { label: 'YDS',   value: careerTotals.receivingYards },
                  { label: 'TD',    value: careerTotals.receivingTDs },
                  { label: 'PCT',   value: seasonStats.catchPct.toFixed(1) + '%' },
                  { label: 'YDS/G', value: seasonStats.receivingYards.toFixed(1) },
                  { label: 'REC/G', value: seasonStats.receptions.toFixed(1) },
                ]} />
              )}
              {/* Defense */}
              {seasonStats.tackles > 0 && (
                <StatTable title="Defense" color="red" rows={[
                  { label: 'GP',    value: seasonStats.gp },
                  { label: 'TKL',   value: careerTotals.tackles },
                  { label: 'SCK',   value: careerTotals.defensiveSacks },
                  { label: 'INT',   value: careerTotals.defInterceptions },
                  { label: 'TKL/G', value: seasonStats.tackles.toFixed(1) },
                  { label: 'SCK/G', value: seasonStats.defensiveSacks.toFixed(1) },
                ]} />
              )}
              {/* Kicking */}
              {seasonStats.fieldGoalsAttempted > 0 && (
                <StatTable title="Kicking" color="yellow" rows={[
                  { label: 'GP',    value: seasonStats.gp },
                  { label: 'FGM',   value: careerTotals.fieldGoalsMade },
                  { label: 'FGA',   value: careerTotals.fieldGoalsAttempted },
                  { label: 'FG%',   value: seasonStats.fgPct.toFixed(1) + '%' },
                  { label: 'XPM',   value: careerTotals.extraPointsMade },
                  { label: 'XPA',   value: careerTotals.extraPointsAttempted },
                  { label: 'XP%',   value: seasonStats.xpPct.toFixed(1) + '%' },
                ]} />
              )}
              {/* Returning */}
              {careerTotals.returnYards > 0 && (
                <StatTable title="Returning" color="orange" rows={[
                  { label: 'GP',    value: seasonStats.gp },
                  { label: 'RET',   value: careerTotals.returnYards },
                  { label: 'YDS',   value: careerTotals.returnYards },
                  { label: 'TD',    value: careerTotals.returnTDs },
                  { label: 'YDS/G', value: seasonStats.returnYards.toFixed(1) },
                ]} />
              )}
            </>
          )}
        </div>
      )}

      {/* ── GAME LOG TAB ── */}
      {activeTab === 'gamelog' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Game Log</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <MultiSeasonSelector
                availableSeasons={availableSeasons.map(s => ({ id: s.id, name: s.name, isCurrent: s.isCurrent }))}
                selectedSeasons={selectedSeasons}
                onChange={setSelectedSeasons}
                accentColor="#1872de"
              />
            </div>
          </div>

          {seasonGameStats.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-600">
              <Calendar className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No games found for selected season(s).</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Opp</th>
                    <th className="px-3 py-2 text-center">W/L</th>
                    {seasonGameStats.some((g: any) => g.passAttempts > 0) && <>
                      <th className="px-3 py-2 text-center">COMP</th>
                      <th className="px-3 py-2 text-center">ATT</th>
                      <th className="px-3 py-2 text-center">PYDS</th>
                      <th className="px-3 py-2 text-center">PTD</th>
                    </>}
                    {seasonGameStats.some((g: any) => g.rushAttempts > 0) && <>
                      <th className="px-3 py-2 text-center">RYDS</th>
                      <th className="px-3 py-2 text-center">RTD</th>
                    </>}
                    {seasonGameStats.some((g: any) => g.receptions > 0) && <>
                      <th className="px-3 py-2 text-center">REC</th>
                      <th className="px-3 py-2 text-center">RCYDS</th>
                      <th className="px-3 py-2 text-center">RCTD</th>
                    </>}
                    {seasonGameStats.some((g: any) => g.tackles > 0) && <>
                      <th className="px-3 py-2 text-center">TKL</th>
                      <th className="px-3 py-2 text-center">SCK</th>
                      <th className="px-3 py-2 text-center">INT</th>
                    </>}
                    {seasonGameStats.some((g: any) => g.fieldGoalsAttempted > 0) && <>
                      <th className="px-3 py-2 text-center">FGM/A</th>
                    </>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[...seasonGameStats]
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((game: any) => (
                      <tr key={game.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          <Link href={`/games/${game.gameId}`} className="hover:text-hsfl-blue transition-colors">
                            vs {game.opponent}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${game.result === 'W' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                            {game.result}
                          </span>
                        </td>
                        {seasonGameStats.some((g: any) => g.passAttempts > 0) && <>
                          <td className="px-3 py-2.5 text-center">{game.completions || 0}</td>
                          <td className="px-3 py-2.5 text-center">{game.passAttempts || 0}</td>
                          <td className="px-3 py-2.5 text-center font-semibold">{game.passingYards || 0}</td>
                          <td className="px-3 py-2.5 text-center">{game.passingTDs || 0}</td>
                        </>}
                        {seasonGameStats.some((g: any) => g.rushAttempts > 0) && <>
                          <td className="px-3 py-2.5 text-center font-semibold">{game.rushingYards || 0}</td>
                          <td className="px-3 py-2.5 text-center">{game.rushingTDs || 0}</td>
                        </>}
                        {seasonGameStats.some((g: any) => g.receptions > 0) && <>
                          <td className="px-3 py-2.5 text-center">{game.receptions || 0}</td>
                          <td className="px-3 py-2.5 text-center font-semibold">{game.receivingYards || 0}</td>
                          <td className="px-3 py-2.5 text-center">{game.receivingTDs || 0}</td>
                        </>}
                        {seasonGameStats.some((g: any) => g.tackles > 0) && <>
                          <td className="px-3 py-2.5 text-center font-semibold">{game.tackles || 0}</td>
                          <td className="px-3 py-2.5 text-center">{game.defensiveSacks || 0}</td>
                          <td className="px-3 py-2.5 text-center">{game.defInterceptions || 0}</td>
                        </>}
                        {seasonGameStats.some((g: any) => g.fieldGoalsAttempted > 0) && <>
                          <td className="px-3 py-2.5 text-center">{game.fieldGoalsMade || 0}/{game.fieldGoalsAttempted || 0}</td>
                        </>}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ── StatTable helper component ──
function StatTable({ title, color, rows }: {
  title: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'orange';
  rows: { label: string; value: string | number }[];
}) {
  const colorMap = {
    blue:   { bg: 'bg-blue-600',   light: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-700 dark:text-blue-400' },
    green:  { bg: 'bg-green-600',  light: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
    purple: { bg: 'bg-purple-600', light: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400' },
    red:    { bg: 'bg-red-600',    light: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-700 dark:text-red-400' },
    yellow: { bg: 'bg-yellow-500', light: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' },
    orange: { bg: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400' },
  };
  const c = colorMap[color];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className={`${c.bg} px-5 py-2.5`}>
        <h3 className="text-white font-bold text-sm uppercase tracking-widest">{title}</h3>
      </div>
      <div className={`grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-px ${c.light}`}>
        {rows.map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-3 py-3">
            <div className={`text-xl font-black ${c.text}`}>{value}</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
