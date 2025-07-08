import React from 'react';

// ------------------ EXAMPLE PLAYERS ------------------
// Added "year" to every object so the UI can show when the season occurred.
// Salaries are shown in millions just like before. WAR numbers unchanged.
const individualExamples = [
  {
    category: 'Historic',
    player: 'Dwight Gooden',
    salary: '0.45',
    war: '13.2',
    year: '1985',
    colorClass: 'text-purple-500',
    display: '$0.45M / 13.2 WAR'
  },
  {
    category: 'High Value',
    player: 'Freddie Freeman',
    salary: '15',
    war: '3.5',
    year: '2020',
    colorClass: 'text-green-500',
    display: '$15M / 3.5 WAR'
  },
  {
    category: 'Average',
    player: 'Zack Greinke',
    salary: '29.6',
    war: '3.5',
    year: '2017',
    colorClass: 'text-yellow-500',
    display: '$29.6M / 3.5 WAR'
  },
  {
    category: 'Poor Value',
    player: 'Chris Davis',
    salary: '23.0',
    war: '-0.5',
    year: '2018',
    colorClass: 'text-red-500',
    display: '$23M / -0.5 WAR'
  }
];

// ------------------ EXAMPLE TEAMS ------------------
// Team objects already contain "year"; kept as‑is for now.
const teamExamples = [
  {
    category: 'Elite',
    team: 'Tampa Bay Rays',
    payroll: '71',
    war: '55',
    colorClass: 'text-purple-500',
    display: '$71M / 55 WAR',
    year: '2023'
  },
  {
    category: 'Above Avg',
    team: 'Atlanta Braves',
    payroll: '203',
    war: '41',
    colorClass: 'text-green-500',
    display: '$203M / 41 WAR',
    year: '2023'
  },
  {
    category: 'Average',
    team: 'Texas Rangers',
    payroll: '241',
    war: '37.7',
    colorClass: 'text-yellow-500',
    display: '$241M / 37.7 WAR',
    year: '2023'
  },
  {
    category: 'Inefficient',
    team: 'Oakland Athletics',
    payroll: '62.7',
    war: '2.7',
    colorClass: 'text-red-500',
    display: '$62.7M / 2.7 WAR',
    year: '2023'
  }
];

const ExampleContracts = ({ mode, onExampleSelect }) => {
  const examples = mode === 'individual' ? individualExamples : teamExamples;

  return (
    <div className="bg-gray-900 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-gray-800">
      <h3 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 md:mb-3">
        {mode === 'individual' ? 'Example Contracts' : 'Example Teams'}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onExampleSelect(example)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
          >
            <div className={`${example.colorClass} font-semibold`}>
              {example.category}
            </div>
            <div className="text-gray-400 text-xs">
              {mode === 'individual'
                ? `${example.player} (${example.year})`
                : `${example.team} (${example.year})`}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {example.display}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExampleContracts;
