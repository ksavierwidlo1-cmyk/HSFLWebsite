'use client';

import { ChevronRight, Radio, ExternalLink, User, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [liveStream, setLiveStream] = useState<any>(null);
  const [currentSeason, setCurrentSeason] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesRes, gamesRes, teamsRes, playersRes, streamRes, seasonsRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/games'),
        fetch('/api/teams'),
        fetch('/api/players'),
        fetch('/api/live-stream'),
        fetch('/api/seasons')
      ]);
      const [articlesData, gamesData, teamsData, playersData, streamData, seasonsData] = await Promise.all([
        articlesRes.json(),
        gamesRes.json(),
        teamsRes.json(),
        playersRes.json(),
        streamRes.json(),
        seasonsRes.json()
      ]);
      setArticles(articlesData);
      setGames(gamesData);
      setTeams(teamsData);
      setPlayers(playersData);
      setLiveStream(streamData.stream);
      const current = Array.isArray(seasonsData) ? seasonsData.find((s: any) => s.isCurrent) : null;
      setCurrentSeason(current || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const latestArticles = articles
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 3);

  // Calculate team rankings using same logic as standings page
  const teamRankings = teams
    .map(team => {
      const teamGames = games.filter(
        g => (g.homeTeamId === team.id || g.awayTeamId === team.id) && g.status === 'completed'
      );
      let wins = 0;
      let losses = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;
      teamGames.forEach(g => {
        const isHome = g.homeTeamId === team.id;
        const teamScore = isHome ? (g.homeScore || 0) : (g.awayScore || 0);
        const oppScore = isHome ? (g.awayScore || 0) : (g.homeScore || 0);
        pointsFor += teamScore;
        pointsAgainst += oppScore;
        let teamWon = false;
        if (g.isForfeit && g.forfeitWinner) {
          teamWon = (isHome && g.forfeitWinner === 'home') || (!isHome && g.forfeitWinner === 'away');
        } else {
          teamWon = teamScore > oppScore;
        }
        if (teamWon) wins++; else losses++;
      });
      const pointDifferential = pointsFor - pointsAgainst;
      return { team, wins, losses, pointDifferential };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return b.pointDifferential - a.pointDifferential;
    })
    .slice(0, 10);

  // Top Performers (football stats)
  const topPasser = [...players].sort(
    (a, b) => (b.stats?.passingYards || 0) - (a.stats?.passingYards || 0)
  )[0];
  const topRusher = [...players].sort(
    (a, b) => (b.stats?.rushingYards || 0) - (a.stats?.rushingYards || 0)
  )[0];
  const topReceiver = [...players].sort(
    (a, b) => (b.stats?.receivingYards || 0) - (a.stats?.receivingYards || 0)
  )[0];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Image */}
      <div className="relative min-h-[70vh] mb-8 overflow-hidden rounded-lg bg-gray-900">
        {/* Custom hero background image — place your image at /public/hero-bg.jpg */}
        <img
          src="/hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[70vh] px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            High School Football League
          </h1>
          <p className="text-xl sm:text-2xl text-gray-100 mb-8 max-w-3xl drop-shadow-lg">
            Roblox's most realistic football league.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/games"
              className="px-8 py-4 bg-hsfl-blue hover:bg-hsfl-blue-dark text-white rounded-lg font-bold text-lg transition-colors shadow-xl"
            >
              View Schedule
            </Link>
            <Link
              href="/standings"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-lg font-bold text-lg transition-colors shadow-xl"
            >
              View Standings
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - News */}
          <div className="lg:col-span-2 space-y-6">
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
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      src={`https://player.twitch.tv/?channel=${liveStream.twitch_channel}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Watching on Twitch:{' '}
                      <span className="font-mono font-semibold">{liveStream.twitch_channel}</span>
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
                <Link
                  href="/news"
                  className="text-hsfl-blue hover:text-hsfl-blue-dark flex items-center text-sm"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {latestArticles.length > 0 ? (
                  latestArticles.map(article => (
                    <article
                      key={article.id}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-hsfl-blue dark:hover:border-hsfl-blue transition-colors shadow-sm"
                    >
                      {article.image && (
                        <div className="w-full h-48">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {new Date(article.publishedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          • By {article.author}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {article.excerpt || article.content?.slice(0, 150)}...
                        </p>
                        <Link
                          href={`/news/${article.id}`}
                          className="inline-block mt-4 text-hsfl-blue hover:text-hsfl-blue-dark font-medium"
                        >
                          Read More →
                        </Link>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 shadow-sm">
                    No news articles yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">

              {/* High School Football Rankings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-hsfl-blue px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      High Football Rankings
                    </h2>
                    {currentSeason && (
                      <span className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                        {currentSeason.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-2 pt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 dark:text-gray-400 text-xs border-b border-gray-200 dark:border-gray-700">
                        <th className="text-center px-2 py-2 w-8">#</th>
                        <th className="text-left px-2 py-2">Team</th>
                        <th className="text-right px-2 py-2 pr-3">Record</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamRankings.length > 0 ? (
                        teamRankings.map((entry, index) => (
                          <tr
                            key={entry.team.id}
                            className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-2 py-2 font-bold text-gray-500 dark:text-gray-400 text-center text-xs">
                              {index + 1}
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-2">
                                {entry.team.logo ? (
                                  <img
                                    src={entry.team.logo}
                                    alt={entry.team.name}
                                    className="w-6 h-6 object-contain flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-hsfl-blue flex-shrink-0" />
                                )}
                                <span className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                  {entry.team.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-2 pr-3 text-right">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {entry.wins > 0 || entry.losses > 0 ? `${entry.wins}-${entry.losses}` : '—'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr
                            key={i}
                            className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <td className="px-2 py-2 text-center text-gray-400 text-xs">{i + 1}</td>
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                                <span className="text-gray-400 dark:text-gray-500 text-sm">TBD</span>
                              </div>
                            </td>
                            <td className="px-2 py-2 pr-3 text-right text-gray-400">—</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-3">
                  <Link
                    href="/standings"
                    className="block text-center py-2 px-4 bg-hsfl-blue hover:bg-hsfl-blue-dark text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Full Standings
                  </Link>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Top Performers
                  </h2>
                  {currentSeason && (
                    <span className="text-xs font-semibold bg-hsfl-blue text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                      {currentSeason.name}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <PerformerRow
                    label="Passing Yards"
                    player={topPasser}
                    statValue={topPasser?.stats?.passingYards}
                    teamAbbr={teams.find(t => t.id === topPasser?.teamId)?.abbreviation}
                  />
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <PerformerRow
                    label="Rushing Yards"
                    player={topRusher}
                    statValue={topRusher?.stats?.rushingYards}
                    teamAbbr={teams.find(t => t.id === topRusher?.teamId)?.abbreviation}
                  />
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <PerformerRow
                    label="Receiving Yards"
                    player={topReceiver}
                    statValue={topReceiver?.stats?.receivingYards}
                    teamAbbr={teams.find(t => t.id === topReceiver?.teamId)?.abbreviation}
                  />
                </div>

                <Link
                  href="/stats"
                  className="block text-center mt-4 py-2 px-4 bg-hsfl-blue hover:bg-hsfl-blue-dark text-white rounded-lg font-medium transition-colors text-sm"
                >
                  View All Stats
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PerformerRow({
  label,
  player,
  statValue,
  teamAbbr,
}: {
  label: string;
  player: any;
  statValue: number | undefined;
  teamAbbr: string | undefined;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </div>
      {player ? (
        <Link
          href={`/players/${player.id}`}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            {player.profilePicture ? (
              <img
                src={player.profilePicture}
                alt={player.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {player.displayName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{teamAbbr || 'EA'}</div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-hsfl-blue">
              {(statValue || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">YDS</div>
          </div>
        </Link>
      ) : (
        <p className="text-gray-400 dark:text-gray-500 text-sm py-1 px-2">No data yet</p>
      )}
    </div>
  );
}
