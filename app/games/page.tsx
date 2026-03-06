'use client';

import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSeasonDisplay, LEAGUE_CONFIG } from '@/lib/config';
import MultiSeasonSelector from '@/components/MultiSeasonSelector';

type GameFilter = 'all' | 'upcoming' | 'completed';

export default function GamesPage() {
  const [filter, setFilter] = useState<GameFilter>('all');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(['All-Time']);
  const [availableSeasons, setAvailableSeasons] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchSeasons();
  }, []);

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

  const fetchData = async () => {
    try {
      const [gamesRes, teamsRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/teams')
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

  const filteredGames = games.filter(game => {
    // Filter by status
    if (filter === 'upcoming' && game.status !== 'scheduled') return false;
    if (filter === 'completed' && game.status !== 'completed') return false;
    
    // Filter by season(s)
    if (selectedSeasons.includes('All-Time') && selectedSeasons.length === 1) {
      return true; // Show all games when only All-Time is selected
    }
    
    // Show games from any selected season (excluding All-Time if other seasons are selected)
    const seasonsToFilter = selectedSeasons.filter(s => s !== 'All-Time');
    if (seasonsToFilter.length > 0) {
      return seasonsToFilter.includes(game.season);
    }
    
    return true;
  }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center text-gray-900 dark:text-white">
          <Calendar className="w-10 h-10 mr-3 text-eba-blue" />
          Games Schedule
        </h1>
        <p className="text-gray-600 dark:text-gray-400">View upcoming games and recent results</p>
      </div>

      {/* Season Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Select Season(s)
        </label>
        <MultiSeasonSelector
          availableSeasons={availableSeasons.map(s => ({
            id: s.id,
            name: s.name,
            isCurrent: s.isCurrent
          }))}
          selectedSeasons={selectedSeasons}
          onChange={setSelectedSeasons}
          accentColor="#00A8E8"
        />
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-eba-blue text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All Games
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-eba-blue text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-eba-blue text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Results
        </button>
      </div>

      {/* Games List */}
      <div className="space-y-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => {
            const homeTeam = teams.find(t => t.id === game.homeTeamId);
            const awayTeam = teams.find(t => t.id === game.awayTeamId);
            const isCompleted = game.status === 'completed';
            const gameDate = new Date(game.scheduledDate);

            return (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-eba-blue dark:hover:border-eba-blue transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    {isCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Final</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-eba-blue" />
                        <span>Scheduled</span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      {gameDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {!isCompleted && (
                      <>
                        <span>•</span>
                        <span>
                          {gameDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZone: 'America/New_York',
                          })} EST
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{getSeasonDisplay(game.season)}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Away Team */}
                  <div className="flex items-center justify-end space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-lg text-gray-900 dark:text-white">{awayTeam?.name || 'TBD'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Away</div>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold overflow-hidden"
                      style={{
                        backgroundColor: awayTeam?.colors.primary || '#333',
                        color: awayTeam?.colors.secondary || '#fff',
                      }}
                    >
                      {awayTeam?.logo ? (
                        <Image
                          src={awayTeam.logo}
                          alt={awayTeam.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        awayTeam?.name.charAt(0) || '?'
                      )}
                    </div>
                  </div>

                  {/* Score / VS */}
                  <div className="text-center">
                    {isCompleted ? (
                      <div>
                        {game.isForfeit && (!game.awayScore || game.awayScore === 0) && (!game.homeScore || game.homeScore === 0) ? (
                          // Show FFW/FFL labels when scores are null or 0-0
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            <span className={game.forfeitWinner === 'away' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {game.forfeitWinner === 'away' ? 'FFW' : 'FFL'}
                            </span>
                            {' - '}
                            <span className={game.forfeitWinner === 'home' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {game.forfeitWinner === 'home' ? 'FFW' : 'FFL'}
                            </span>
                          </div>
                        ) : (
                          // Show actual scores
                          <>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                              {game.awayScore} - {game.homeScore}
                            </div>
                            {game.isForfeit && (
                              <div className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                                FORFEIT
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">VS</div>
                    )}
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold overflow-hidden"
                      style={{
                        backgroundColor: homeTeam?.colors.primary || '#333',
                        color: homeTeam?.colors.secondary || '#fff',
                      }}
                    >
                      {homeTeam?.logo ? (
                        <Image
                          src={homeTeam.logo}
                          alt={homeTeam.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        homeTeam?.name.charAt(0) || '?'
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-gray-900 dark:text-white">{homeTeam?.name || 'TBD'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Home</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 shadow-sm">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No games found</p>
            <p className="text-sm mt-1">Check back later for the schedule!</p>
          </div>
        )}
      </div>
    </div>
  );
}
