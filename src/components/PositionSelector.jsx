import React from 'react';

const PositionSelector = ({ position, onPositionChange }) => {
  const positions = [
    { value: 'C', label: 'Catcher', avgSalary: 3.2, avgWAR: 1.8 },
    { value: '1B', label: 'First Base', avgSalary: 8.5, avgWAR: 2.1 },
    { value: '2B', label: 'Second Base', avgSalary: 5.8, avgWAR: 2.3 },
    { value: '3B', label: 'Third Base', avgSalary: 7.2, avgWAR: 2.4 },
    { value: 'SS', label: 'Shortstop', avgSalary: 7.8, avgWAR: 2.5 },
    { value: 'LF', label: 'Left Field', avgSalary: 6.5, avgWAR: 1.9 },
    { value: 'CF', label: 'Center Field', avgSalary: 7.1, avgWAR: 2.2 },
    { value: 'RF', label: 'Right Field', avgSalary: 6.8, avgWAR: 2.0 },
    { value: 'DH', label: 'Designated Hitter', avgSalary: 9.2, avgWAR: 1.5 },
    { value: 'SP', label: 'Starting Pitcher', avgSalary: 8.9, avgWAR: 2.8 },
    { value: 'RP', label: 'Relief Pitcher', avgSalary: 3.1, avgWAR: 0.9 }
  ];

  return (
    <div className="bg-gray-800 rounded p-4 border border-gray-700 mb-4">
      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
        Position
      </label>
      <select
        value={position}
        onChange={(e) => onPositionChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-900 text-white rounded border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
      >
        <option value="">Select Position (Optional)</option>
        {positions.map(pos => (
          <option key={pos.value} value={pos.value}>
            {pos.label} (Avg: ${pos.avgSalary}M / {pos.avgWAR} WAR)
          </option>
        ))}
      </select>
    </div>
  );
};

export default PositionSelector;
