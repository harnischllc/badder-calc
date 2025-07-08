import React from 'react';
import { ExternalLink } from 'lucide-react';
import { InputField } from './ContractWARComponents';

const CalculatorForm = ({ 
  mode, 
  salary, 
  setSalary,
  war,
  setWar,
  teamPayroll,
  setTeamPayroll,
  teamWAR,
  setTeamWAR,
  warType,
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

  // Team mode
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div>
        <InputField
          label="Team Payroll ($M)"
          value={teamPayroll}
          onChange={(e) => setTeamPayroll(e.target.value)}
          placeholder="e.g., 150"
          error={errors.teamPayroll}
          tooltip="Enter the team's total payroll in millions"
        />
        
        <a href="https://www.spotrac.com/mlb/payroll/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Team payrolls on Spotrac
        </a>
      </div>
      
      <div>
        <InputField
          label="Team WAR"
          value={teamWAR}
          onChange={(e) => setTeamWAR(e.target.value)}
          placeholder="e.g., 45"
          error={errors.teamWAR}
          tooltip="Combined WAR for all players"
        />
        
        <a href="https://www.fangraphs.com/depthcharts.aspx?position=Team"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Team WAR on FanGraphs
        </a>
      </div>
    </div>
  );
};

export default CalculatorForm;
