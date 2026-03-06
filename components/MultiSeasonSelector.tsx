'use client';

import { ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Season {
  id: string;
  name: string;
  isCurrent?: boolean;
}

interface MultiSeasonSelectorProps {
  availableSeasons: Season[];
  selectedSeasons: string[];
  onChange: (seasons: string[]) => void;
  accentColor?: string;
  className?: string;
}

export default function MultiSeasonSelector({ 
  availableSeasons, 
  selectedSeasons,
  onChange,
  accentColor = '#00A8E8',
  className = ''
}: MultiSeasonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSeason = (seasonName: string) => {
    if (seasonName === 'All-Time') {
      // If All-Time is selected, clear all other selections
      onChange(['All-Time']);
    } else {
      // Remove All-Time if it exists
      const newSelections = selectedSeasons.filter(s => s !== 'All-Time');
      
      if (newSelections.includes(seasonName)) {
        // Remove the season
        const updated = newSelections.filter(s => s !== seasonName);
        // If no seasons left, default to All-Time
        onChange(updated.length === 0 ? ['All-Time'] : updated);
      } else {
        // Add the season
        onChange([...newSelections, seasonName]);
      }
    }
  };

  const clearAll = () => {
    onChange(['All-Time']);
  };

  const selectAll = () => {
    onChange(['All-Time', ...availableSeasons.map(s => s.name)]);
  };

  const getDisplayText = () => {
    if (selectedSeasons.includes('All-Time') && selectedSeasons.length === 1) {
      return 'All-Time';
    }
    if (selectedSeasons.includes('All-Time')) {
      return 'All Seasons';
    }
    if (selectedSeasons.length === 0) {
      return 'Select Seasons';
    }
    if (selectedSeasons.length === 1) {
      return selectedSeasons[0];
    }
    return `${selectedSeasons.length} Seasons Selected`;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="appearance-none bg-gradient-to-r text-white px-4 sm:px-6 py-2 sm:py-2.5 pr-8 sm:pr-10 rounded-xl text-sm sm:text-base font-medium cursor-pointer transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 w-full sm:w-auto min-w-[160px] sm:min-w-[200px] flex items-center justify-between"
        style={{
          backgroundImage: `linear-gradient(to right, ${accentColor}, ${adjustColor(accentColor, -20)})`
        }}
      >
        <span className="truncate">{getDisplayText()}</span>
        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden min-w-[200px] sm:min-w-[250px]">
          {/* Header with Actions */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">SELECT SEASONS</span>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); clearAll(); }}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); selectAll(); }}
                className="text-xs font-medium hover:opacity-80 transition-opacity"
                style={{ color: accentColor }}
              >
                All
              </button>
            </div>
          </div>

          {/* Season Options */}
          <div className="max-h-[300px] overflow-y-auto">
            {/* All-Time Option */}
            <label
              className="flex items-center px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSeasons.includes('All-Time') && selectedSeasons.length === 1}
                onChange={() => toggleSeason('All-Time')}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2 cursor-pointer"
                style={{ 
                  accentColor: accentColor,
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                All-Time
              </span>
            </label>

            {/* Individual Seasons */}
            {availableSeasons.map((season) => (
              <label
                key={season.id}
                className="flex items-center px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSeasons.includes(season.name) && !selectedSeasons.includes('All-Time')}
                  onChange={() => toggleSeason(season.name)}
                  disabled={selectedSeasons.includes('All-Time') && selectedSeasons.length === 1}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ accentColor: accentColor }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {season.name}
                  {season.isCurrent && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ 
                        backgroundColor: `${accentColor}20`,
                        color: accentColor 
                      }}
                    >
                      Current
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>

          {/* Selected Pills (when multiple selected) */}
          {selectedSeasons.length > 1 && !selectedSeasons.includes('All-Time') && (
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="flex flex-wrap gap-1.5">
                {selectedSeasons.map((season) => (
                  <span
                    key={season}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {season}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSeason(season);
                      }}
                      className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const clamp = (num: number) => Math.min(Math.max(num, 0), 255);
  
  // Parse hex color
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
