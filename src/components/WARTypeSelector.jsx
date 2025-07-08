import React from 'react';

const WARTypeSelector = ({ warType, onWarTypeChange }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-gray-800">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">WAR Type:</span>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onWarTypeChange('fWAR')}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-sm transition-colors ${
              warType === 'fWAR' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            fWAR
          </button>
          <button
            onClick={() => onWarTypeChange('avg')}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-sm transition-colors ${
              warType === 'avg' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Average
          </button>
          <button
            onClick={() => onWarTypeChange('bWAR')}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-sm transition-colors ${
              warType === 'bWAR' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            bWAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default WARTypeSelector;
