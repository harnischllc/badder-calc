import React from 'react';

const individualExamples = [
  {
    category: 'Historic',
    player: 'Dwight Gooden',
    salary: '0.45',
    war: '13.2',
    colorClass: 'text-purple-500',
    display: '$0.45M / 13.2 WAR'
  },
  {
    category: 'High Value',
    player: 'Freddie Freeman',
    salary: '15',
    war: '3.5',
    colorClass: 'text-green-500',
    display: '$15M / 3.5 WAR'
  },
  {
    category: 'Average',
    player: 'Zack Greinke',
    salary: '29.6',
    war: '3.5',
    colorClass: 'text-yellow-500',
    display: '$29.6M / 3.5 WAR'
  },
  {
    category: 'Poor Value',
    player: 'Chris Davis',
    salary: '23.0',
    war: '-0.5',
    colorClass: 'text-red-500',
    display: '$23M / -0.5 WAR'
  }
];

const teamExamples = [
  {
    category: 'Elite',
    team: 'Tampa Bay Rays',
    payroll: '71',
    war: '55',
    colorClass: 'text-purple-500',
    display: '$71M / 55 WAR'
  },
  {
    category: 'Good',
    team: 'Mid Market Team',
    payroll: '150',
    war: '45',
    colorClass: 'text-green-500',
    display: '$150M / 45 WAR'
  },
  {
    category: 'Average',
    team: 'Big Market Team',
    payroll: '250',
    war: '50',
    colorClass: 'text-yellow-500',
    display: '$250M / 50 WAR'
  },
  {
    category: 'Poor',
    team: 'Underperforming',
    payroll: '200',
    war: '25',
    colorClass: 'text-red-500',
    display: '$200M / 25 WAR'
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
              {mode === 'individual' ? example.player : example.team}
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
