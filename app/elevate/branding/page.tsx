'use client';

import { Users, Shield, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type ConferenceFilter = 'all' | 'Eastern' | 'Western';

export default function Elevate302BrandingPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [conferenceFilter, setConferenceFilter] = useState<ConferenceFilter>('all');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/elevate/teams');
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter teams by conference
  const filteredTeams = teams.filter(team => {
    if (conferenceFilter === 'all') return true;
    return team.conference === conferenceFilter;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading teams...</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Elevate 302 Header */}
      <div className="mb-8 flex items-center space-x-4">
        <Image 
          src="/elevate302.png" 
          alt="Elevate 302" 
          width={80} 
          height={80}
          className="rounded-lg"
        />
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#8cd2fe' }}>Elevate 302 Branding</h1>
          <p className="text-gray-600 dark:text-gray-400">Meet the teams and leadership of Elevate 302</p>
        </div>
      </div>

      {/* Conference Filter */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setConferenceFilter('all')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            conferenceFilter === 'all'
              ? 'text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }`}
          style={conferenceFilter === 'all' ? { backgroundColor: '#8cd2fe' } : {}}
        >
          All Teams
        </button>
        <button
          onClick={() => setConferenceFilter('Eastern')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            conferenceFilter === 'Eastern'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-blue-300 dark:border-gray-600'
          }`}
        >
          Eastern Conference
        </button>
        <button
          onClick={() => setConferenceFilter('Western')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            conferenceFilter === 'Western'
              ? 'bg-red-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 border border-red-300 dark:border-gray-600'
          }`}
        >
          Western Conference
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTeams.map((team) => (
          <Link
            key={team.id}
            href={`/elevate/teams/${team.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-[#8cd2fe] dark:hover:border-[#8cd2fe] transition-colors shadow-sm cursor-pointer"
          >
            {/* Team Header */}
            <div className="flex items-center space-x-4 mb-6">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold overflow-hidden"
                style={{
                  backgroundColor: team.colors.primary,
                  color: team.colors.secondary,
                }}
              >
                {team.logo ? (
                  <Image
                    src={team.logo}
                    alt={team.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  team.name.charAt(0)
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{team.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
                    team.conference === 'Western' ? 'bg-red-600' : 'bg-blue-600'
                  }`}>
                    {team.conference} Conference
                  </span>
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: team.colors.primary }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: team.colors.secondary }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Team Leadership */}
            <div className="space-y-4">
              {team.owner && (
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 mt-0.5" style={{ color: '#8cd2fe' }} />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Franchise Owner</div>
                    <div className="font-medium text-gray-900 dark:text-white">{team.owner}</div>
                  </div>
                </div>
              )}

              {team.generalManager && (
                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 mt-0.5" style={{ color: '#8cd2fe' }} />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">General Manager</div>
                    <div className="font-medium text-gray-900 dark:text-white">{team.generalManager}</div>
                  </div>
                </div>
              )}

              {team.headCoach && (
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 mt-0.5" style={{ color: '#8cd2fe' }} />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Head Coach</div>
                    <div className="font-medium text-gray-900 dark:text-white">{team.headCoach}</div>
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No teams found in this conference.</p>
        </div>
      )}
    </div>
  );
}
