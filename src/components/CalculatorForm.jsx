import React from 'react';
import { ExternalLink } from 'lucide-react';
import { InputField } from './ContractWARComponents';

const CalculatorForm = ({ 
  mode, 
  salary, 
  setSalary,
  war,
  setWar,
  wrcPlus,
  setWrcPlus,
  teamPayroll,
  setTeamPayroll,
  teamWAR,
  setTeamWAR,
  warType,
  payrollType,
  setPayrollType,
  errors 
}) => {
  if (mode === 'individual') {
    return (
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <InputField
            label="Player Salary ($M)"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g., 35.5"
            error={errors.salary}
            tooltip="Enter the player's annual salary in millions"
          />
          
          <a href="https://www.spotrac.com/mlb/contracts/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Look up salaries on Spotrac
          </a>
        </div>
        
        <div>
          <InputField
            label={`Player ${warType === 'avg' ? 'WAR' : warType}`}
            value={war}
            onChange={(e) => setWar(e.target.value)}
            placeholder="e.g., 5.4"
            error={errors.war}
            tooltip={`Wins Above Replacement (${warType})`}
          />
          <div className="flex gap-4 mt-2">
            <a href="https://www.fangraphs.com/leaders/war"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              fWAR
            </a>
            
            <a href="https://www.baseball-reference.com/leagues/AL/2024-WAR-leaders.shtml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              bWAR
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  if (mode === 'wrcplus') {
    return (
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <InputField
            label="Player Salary ($M)"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g., 35.5"
            error={errors.salary}
            tooltip="Enter the player's annual salary in millions"
          />
          
          <a href="https://www.spotrac.com/mlb/contracts/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Look up salaries on Spotrac
          </a>
        </div>
        
        <div>
          <InputField
            label="Player wRC+"
            value={wrcPlus}
            onChange={(e) => setWrcPlus(e.target.value)}
            placeholder="e.g., 125"
            error={errors.wrcPlus}
            tooltip="Weighted Runs Created Plus (100 = league average)"
          />
          <a href="https://www.fangraphs.com/leaders/offense?season=2024&month=0&season1=2024&ind=0&team=0&pos=all&stats=bat&qual=y&type=8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Look up wRC+ on FanGraphs
          </a>
        </div>
      </div>
    );
  }

  // Team mode
  return (
    <div className="space-y-6 mb-6">
      {/* Payroll Type Selector */}
      <div className="bg-gray-800 rounded p-4 border border-gray-700">
        <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Payroll Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="total"
              checked={payrollType === 'total'}
              onChange={(e) => setPayrollType(e.target.value)}
              className="mr-2 text-red-500"
            />
            <span className="text-white">Total Payroll</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="active"
              checked={payrollType === 'active'}
              onChange={(e) => setPayrollType(e
