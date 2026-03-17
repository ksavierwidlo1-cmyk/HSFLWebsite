'use client';

import { Calendar, ChevronRight, Radio, ExternalLink, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [liveStream, setLiveStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Configure your intro video here - can be YouTube, Vimeo, or direct video URL
  const introVideoUrl = "https://www.youtube.com/embed/npCVD0Pv-3U"; // Replace with your video URL

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesRes, gamesRes, teamsRes, playersRes, streamRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/games'),
        fetch('/api/teams'),
        fetch('/api/players'),
        fetch('/api/live-stream')
      ]);
      const [articlesData, gamesData, teamsData, playersData, streamData] = await Promise.all([
        articlesRes.json(),
        gamesRes.json(),
        teamsRes.json(),
        playersRes.json(),
        streamRes.json()
      ]);
      setArticles(articlesData);
      setGames(gamesData);
      setTeams(teamsData);
      setPlayers(playersData);
      setLiveStream(streamData.stream);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingGames = games
    .filter(g => g.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  const latestArticles = articles
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 3);

  const topPlayers = players
    .filter(p => p.stats && p.stats.gamesPlayed > 0)
    .sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Intro Video */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-1 shadow-xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={introVideoUrl}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="EBA Introduction Video"
              ></iframe>
            </div>
            <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to the Elite Basketball Association
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Experience the most competitive Roblox basketball league. Watch highlights, follow your favorite teams, and witness elite competition.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - News and Articles */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Elite Basketball Association</h1>
            <p className="text-gray-600 dark:text-gray-400">Your home for the most competitive Roblox basketball experience</p>
          </div>

          {/* Live Stream Section */}
          {liveStream && (
            <div className="bg-gradient-to-r from-red-500 to-purple-600 rounded-lg p-1 shadow-lg">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Radio className="w-6 h-6 text-red-600 animate-pulse" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Live Game - Tune In!
                  </h2>
                  <span className="ml-auto px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full animate-pulse">
                    LIVE
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {liveStream.title}
                </h3>

                {/* Twitch Embed */}
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={`https://player.twitch.tv/?channel=${liveStream.twitch_channel}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'ebassociation.com'}`}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Watching on Twitch: <span className="font-mono font-semibold">{liveStream.twitch_channel}</span>
                  </p>
                  <a
                    href={`https://twitch.tv/${liveStream.twitch_channel}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch on Twitch
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Latest News */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest News</h2>
              <Link href="/news" className="text-eba-blue hover:text-blue-600 flex items-center text-sm">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {latestArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-eba-blue dark:hover:border-eba-blue transition-colors shadow-sm"
                >
                  {article.image && (
                    <div className="w-full h-48 relative">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{article.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {new Date(article.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })} • By {article.author}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{article.excerpt || article.content.slice(0, 150)}...</p>
                    <Link
                      href={`/news/${article.id}`}
                      className="inline-block mt-4 text-eba-blue hover:text-blue-600 font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Upcoming Games */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Upcoming Games */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                <Calendar className="w-6 h-6 mr-2 text-eba-blue" />
                Upcoming Games
              </h2>
              
              <div className="space-y-3">
                {upcomingGames.length > 0 ? (
                  upcomingGames.map((game) => {
                    const homeTeam = teams.find(t => t.id === game.homeTeamId);
                    const awayTeam = teams.find(t => t.id === game.awayTeamId);
                    
                    return (
                      <Link
                        key={game.id}
                        href={`/games/${game.id}`}
                        className="block bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-eba-blue dark:hover:border-eba-blue transition-colors shadow-sm"
                      >
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {new Date(game.scheduledDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white">{awayTeam?.name || 'TBD'}</div>
                            <div className="text-gray-600 dark:text-gray-400 text-sm">@ {homeTeam?.name || 'TBD'}</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 shadow-sm">
                    No upcoming games scheduled
                  </div>
                )}
                
                <Link
                  href="/games"
                  className="block text-center py-3 px-4 bg-eba-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  View Full Schedule
                </Link>
              </div>
            </div>

            {/* League Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center shadow-sm">
                <div className="text-3xl font-bold text-eba-blue">{teams.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Teams</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center shadow-sm">
                <div className="text-3xl font-bold text-eba-blue">{players.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Players</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center shadow-sm">
                <div className="text-3xl font-bold text-eba-blue">{games.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Games</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center shadow-sm">
                <div className="text-3xl font-bold text-eba-blue">
                  {games.filter(g => g.status === 'scheduled').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
              </div>
            </div>

            {/* Top Scorers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <TrendingUp className="w-5 h-5 text-eba-blue" />
                Top Scorers
              </h2>
              {topPlayers.length > 0 ? (
                <div className="space-y-3">
                  {topPlayers.map((player, index) => (
                    <Link
                      key={player.id}
                      href={`/players/${player.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-eba-blue">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {player.displayName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {teams.find(t => t.id === player.teamId)?.abbreviation || 'FA'}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-eba-blue">
                        {player.stats?.points?.toFixed(1) || '0.0'}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No player data yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
