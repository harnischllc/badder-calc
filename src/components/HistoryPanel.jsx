import React from 'react';

const HistoryPanel = ({ history, onClearHistory }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Historic Bargain':
      case 'Elite Efficiency':
        return 'text-purple-500';
      case 'High Value':
      case 'Above Average':
        return 'text-green-500';
      case 'Average':
        return 'text-yellow-500';
      case 'Poor Value':
      case 'Below Average':
      case 'Inefficient':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (history.length === 0) return null;

  return (
    <div className="mb-4 md:mb-6 bg-gray-800 rounded p-3 md:p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-2 md:mb-3">
        <h3 className="text-white font-semibold uppercase tracking-wider text-xs sm:text-sm">
          Recent Calculations
        </h3>
        <button
          onClick={onClearHistory}
          className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
        {history.map((entry, index) => (
          <div key={index} className="p-2 sm:p-3 bg-gray-700 rounded">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
              <div>
                <div className="text-white font-medium text-sm">{entry.name}</div>
                <div className="text-gray-400 text-xs mt-0.5 sm:mt-1">
                  {entry.date} • ${entry.costPerWAR}M per WAR
                </div>
              </div>
              <div className={`text-xs sm:text-sm font-medium ${getCategoryColor(entry.category)}`}>
                {entry.category}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
