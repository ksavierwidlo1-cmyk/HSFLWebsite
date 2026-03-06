'use client';

import { Settings as SettingsIcon, Palette, Eye } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [showProfilePics, setShowProfilePics] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedShowPics = localStorage.getItem('showProfilePics');
    if (storedShowPics !== null) {
      setShowProfilePics(storedShowPics === 'true');
    }
  }, []);

  const handleShowProfilePicsChange = (value: boolean) => {
    setShowProfilePics(value);
    localStorage.setItem('showProfilePics', value.toString());
  };

  const themes = [
    { value: 'light', label: 'Light', description: 'Bright and clean', preview: 'bg-white border-gray-300' },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes', preview: 'bg-gray-900 border-gray-700' },
    { value: 'midnight', label: 'Midnight', description: 'Deep blue darkness', preview: 'bg-blue-950 border-blue-900' },
    { value: 'forest', label: 'Forest', description: 'Nature inspired', preview: 'bg-green-950 border-green-900' },
    { value: 'sunset', label: 'Sunset', description: 'Warm orange tones', preview: 'bg-orange-950 border-orange-900' },
    { value: 'ocean', label: 'Ocean', description: 'Cool blue waves', preview: 'bg-cyan-950 border-cyan-900' },
  ];

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center text-gray-900 dark:text-white">
          <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-2 sm:mr-3 text-eba-blue" />
          Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Customize your experience</p>
      </div>

      {/* Theme Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-eba-blue" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Theme</h2>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Choose your preferred color scheme</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value as any)}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                theme === themeOption.value
                  ? 'border-eba-blue bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-eba-blue/50'
              }`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 ${themeOption.preview}`}></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{themeOption.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{themeOption.description}</p>
                </div>
              </div>
              {theme === themeOption.value && (
                <div className="text-eba-blue text-sm font-medium">✓ Currently Active</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-eba-blue" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Display</h2>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Adjust visual preferences</p>
        
        <div className="space-y-4">
          {/* Profile Pictures Toggle */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">Show Profile Pictures</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Display player profile pictures throughout the site</p>
            </div>
            <button
              onClick={() => handleShowProfilePicsChange(!showProfilePics)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showProfilePics ? 'bg-eba-blue' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showProfilePics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Note:</strong> Your settings are saved locally in your browser and will persist across sessions.
        </p>
      </div>
    </div>
  );
}
