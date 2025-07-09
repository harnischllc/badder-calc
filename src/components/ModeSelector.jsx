import React from 'react';
import { Users, User, TrendingUp } from 'lucide-react';

const ModeSelector = ({ mode, onModeChange }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-gray-800">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">Mode:</span>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onModeChange('individual')}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-sm transition-colors flex items-center gap-2 ${
              mode === 'individual' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            WAR Value
          </button>
          <button
            onClick={() => onModeChange('wrcplus')}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-sm transition-colors flex items-center gap-2 ${
              mode === 'wrcplus' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            wRC+ Value
          </button>
          <button
            onClick={() => onModeChange('team')}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-sm transition-colors flex items-center gap-2 ${
              mode === 'team' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Team Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
