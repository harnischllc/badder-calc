import React from 'react';

const YearSelector = ({ year, onYearChange }) => {
  // Generate years from 1985 to current year
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1985; y--) {
    years.push(y);
  }

  return (
    <div className="bg-gray-800 rounded p-4 border border-gray-700 mb-4">
      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
        Season Year
      </label>
      <select
        value={year}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        className="w-full px-4 py-3 bg-gray-900 text-white rounded border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
      >
        {years.map(y => (
          <option key={y} value={y}>
            {y} {y === 2024 ? '(Current)' : ''}
          </option>
        ))}
      </select>
      <div className="text-xs text-gray-500 mt-2">
        Affects league minimum salary and market rate per WAR for historical accuracy
      </div>
    </div>
  );
};

export default YearSelector; 
