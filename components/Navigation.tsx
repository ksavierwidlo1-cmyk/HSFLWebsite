'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Users, Link2, TrendingUp, Calendar, Search, Shield, Settings, Trophy, Briefcase, Award, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useSession, signIn } from 'next-auth/react';

const ebaNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/branding', label: 'Branding', icon: Users },
  { href: '/links', label: 'Links', icon: Link2 },
  { href: '/standings', label: 'Standings', icon: Trophy },
  { href: '/rankings', label: 'Rankings', icon: Award },
  { href: '/stats', label: 'Stats', icon: TrendingUp },
  { href: '/games', label: 'Games', icon: Calendar },
  { href: '/players', label: 'Players', icon: Search },
  { href: '/staff', label: 'Staff', icon: Briefcase },
  { href: '/elevate', label: 'Elevate', icon: TrendingUp },
  { href: '/admin', label: 'Admin', icon: Shield },
];

const elevateNavItems = [
  { href: '/elevate', label: 'Home', icon: Home },
  { href: '/elevate/branding', label: 'Branding', icon: Users },
  { href: '/elevate/links', label: 'Links', icon: Link2 },
  { href: '/elevate/standings', label: 'Standings', icon: Trophy },
  { href: '/elevate/rankings', label: 'Rankings', icon: Award },
  { href: '/elevate/stats', label: 'Stats', icon: TrendingUp },
  { href: '/elevate/games', label: 'Games', icon: Calendar },
  { href: '/elevate/players', label: 'Players', icon: Search },
  { href: '/elevate/staff', label: 'Staff', icon: Briefcase },
  { href: '/elevate/admin', label: 'Admin', icon: Shield },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // Determine if we're in Elevate 302 section
  const isElevate = pathname.startsWith('/elevate');
  const navItems = isElevate ? elevateNavItems : ebaNavItems;

  return (
    <nav className="bg-white dark:bg-[rgb(var(--bg-primary))] border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between min-h-14 sm:min-h-16 py-1 sm:py-2">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href={isElevate ? "/elevate" : "/"} className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src={isElevate ? "/elevate302.png" : "/logo.png"}
                  alt={isElevate ? "Elevate 302" : "EBA Logo"}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-base sm:text-xl text-gray-900 dark:text-white hidden md:block">
                {isElevate ? "Elevate 302" : "Elite Basketball Association"}
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-0.5 sm:gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[rgb(var(--bg-secondary))]'
                    }`}
                    style={isActive ? (isElevate ? { backgroundColor: '#8cd2fe' } : { backgroundColor: '#00A8E8' }) : {}}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Profile Button */}
            {status === "authenticated" && session?.user?.playerId ? (
              <Link
                href={`/players/${session.user.playerId}`}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors shadow-sm ml-1 sm:ml-2 whitespace-nowrap"
                style={isElevate ? 
                  { backgroundColor: '#8cd2fe' } : 
                  { backgroundColor: '#00A8E8' }
                }
              >
                {session.user.profilePicture ? (
                  <img
                    src={session.user.profilePicture}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">Profile</span>
              </Link>
            ) : (
              <button
                onClick={() => signIn("roblox", { callbackUrl: '/' })}
                disabled={status === "loading"}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors shadow-sm ml-1 sm:ml-2 disabled:opacity-50 whitespace-nowrap"
                style={isElevate ? 
                  { backgroundColor: '#8cd2fe' } : 
                  { backgroundColor: '#00A8E8' }
                }
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Log In</span>
              </button>
            )}
            
            <Link
              href="/settings"
              className="ml-1 sm:ml-2 p-1.5 sm:p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
