'use client';

import { useEffect, useState } from 'react';

async function getStaff() {

  try {
    const res = await fetch('/api/elevate/staff');
    const staff = await res.json();
    return staff || [];
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}

export default function ElevateStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/elevate/staff');
      const data = await res.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Group by role
  const roleGroups = staff.reduce((acc: Record<string, any[]>, member: any) => {
    if (!acc[member.role]) {
      acc[member.role] = [];
    }
    acc[member.role].push(member);
    return acc;
  }, {} as Record<string, typeof staff>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#8cd2fe' }}>
          Staff Directory
        </h1>

        <div className="space-y-8">
          {Object.entries(roleGroups).map(([role, members]) => (
            <div key={role}>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {role}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                  >
                    {member.profile_picture && (
                      <img
                        src={member.profile_picture}
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                      />
                    )}
                    <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    {member.team && (
                      <p
                        className="text-sm text-center font-medium mb-3"
                        style={{ color: member.team.primary_color || '#8cd2fe' }}
                      >
                        {member.team.name}
                      </p>
                    )}
                    {member.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {member.bio}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {staff.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No staff members found. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
