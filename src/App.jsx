import React, { useState, useEffect } from 'react';
import { Calculator, X, History, ExternalLink, Users, User } from 'lucide-react';
import * as ContractWARComponents from './components/ContractWARComponents';
import ResultsDisplay from './components/ResultsDisplay';
import TeamResultsDisplay from './components/TeamResultsDisplay';
import PoopConfetti from './components/PoopConfetti';
import { 
  calculateContractMetrics,
  calculateTeamMetrics, 
  validateInputs,
  validateTeamInputs,
  updateURLParams, 
  loadFromURLParams,
  saveHistory,
  loadHistory,
  clearHistory
} from './utils/calculations';
import { LEAGUE_DATA } from './utils/constants';

const ContractWARCalculator = () => {
  const [mode, setMode] = useState('individual');
  const [salary, setSalary] = useState('');
  const [war, setWar] = useState('');
  const [teamPayroll, setTeamPayroll] = useState('');
  const [teamWAR, setTeamWAR] = useState('');
  const [warType, setWarType] = useState('avg');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({ salary: '', war: '', teamPayroll: '', teamWAR: '' });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const { salary: urlSalary, war: urlWar } = loadFromURLParams();
    if (urlSalary && urlWar) {
      setSalary(urlSalary);
      setWar(urlWar);
    }
    
    const savedHistory = loadHistory();
    setHistory(savedHistory);
  }, []);

  const handleCalculate = () => {
    if (mode === 'individual') {
      const validation = validateInputs(salary, war);
      setErrors({ ...errors, ...validation.errors });
      
      if (!validation.isValid) return;
      
      const results = calculateContractMetrics(
        parseFloat(salary), 
        parseFloat(war), 
        LEAGUE_DATA
      );
      
      results.warType = warType;
      results.mode = 'individual';
      
      setResults(results);

      // Trigger confetti for poor value contracts
      if (results.warValueCategory === 'Poor Value') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
      }
      
      const newEntry = {
        ...results,
        name: `${results.playerWAR} ${warType === 'avg' ? 'WAR' : warType} @ $${(results.playerSalary / 1000000).toFixed(1)}M`,
        date: new Date().toLocaleDateString(),
        category: results.warValueCategory,
        costPerWAR: results.costPerWAR
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
      
      updateURLParams(salary, war);
    } else {
      const validation = validateTeamInputs(teamPayroll, teamWAR);
      setErrors({ ...errors, ...validation.errors });
      
      if (!validation.isValid) return;
      
      const results = calculateTeamMetrics(
        parseFloat(teamPayroll), 
        parseFloat(teamWAR), 
        LEAGUE_DATA
      );
      
      results.mode = 'team';
      setResults(results);

      // Trigger confetti for inefficient teams
      if (results.teamCategory === 'Inefficient') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
      }
      
      const newEntry = {
        ...results,
        name: `Team: ${results.teamWAR} WAR @ $${results.teamPayroll}M`,
        date: new Date().toLocaleDateString(),
        category: results.teamCategory,
        costPerWAR: results.costPerWAR
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
    }
  };

  const handleClear = () => {
    setSalary('');
    setWar('');
    setTeamPayroll('');
    setTeamWAR('');
    setResults(null);
    setErrors({ salary: '', war: '', teamPayroll: '', teamWAR: '' });
    updateURLParams('', '');
  };

  const handleClearHistory = () => {
    setHistory([]);
    clearHistory();
  };

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

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Calculator className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider">
              Contract WAR Calculator
            </h1>
          </div>
          <p className="text-gray-400 text-base md:text-lg px-4">
            Analyze MLB contracts from a performance vs. salary perspective
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-gray-900 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">Mode:</span>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => { setMode('individual'); handleClear(); }}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                  mode === 'individual' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Individual Player
              </button>
              <button
                onClick={() => { setMode('team'); handleClear(); }}
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

        {/* WAR Type Toggle (Individual Mode Only) */}
        {mode === 'individual' && (
          <div className="bg-gray-900 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">WAR Type:</span>
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setWarType('fWAR')}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-sm transition-colors ${
                    warType === 'fWAR' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  fWAR
                </button>
                <button
                  onClick={() => setWarType('avg')}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-sm transition-colors ${
                    warType === 'avg' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Average
                </button>
                <button
                  onClick={() => setWarType('bWAR')}
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
        )}

        {/* Example Contracts (Individual Mode) or Team Examples (Team Mode) */}
        <div className="bg-gray-900 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-gray-800">
          <h3 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 md:mb-3">
            {mode === 'individual' ? 'Example Contracts' : 'Example Teams'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {mode === 'individual' ? (
              <>
                <button
                  onClick={() => { setSalary('0.45'); setWar('13.2'); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
                >
                  <div className="text-purple-500 font-semibold">Historic</div>
                  <div className="text-gray-400 text-xs">Gooden '85</div>
                </button>
                <button
                  onClick={() => { setSalary('15'); setWar('3.5'); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
                >
                  <div className="text-green-500 font-semibold">High Value</div>
                  <div className="text-gray-400 text-xs">Freeman '20</div>
                </button>
                <button
                  onClick={() => { setSalary('29.6'); setWar('3.5'); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
                >
                  <div className="text-yellow-500 font-semibold">Average</div>
                  <div className="text-gray-400 text-xs">Greinke '18</div>
                </button>
                <button
                  onClick={() => { setSalary('23.0'); setWar('-0.5'); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
                >
                  <div className="text-red-500 font-semibold">Poor Value</div>
                  <div className="text-gray-400 text-xs">Davis '19</div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setTeamPayroll('71'); setTeamWAR('55'); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
                >
                  <div className="text-purple-500 font-semibold">Elite</div>
                  <div className="text-gray-400 text-xs">TB Rays</div>
                </button>
                <button
                  onClick={() => { setTeamPayroll('150'); setTeamWAR('45'); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
                >
                  <div className="text-green-500 font-semibold">Good</div>
                  <div className="text-gray-400 text-xs">Mid Market</div>
                </button>
                <button
                  onClick={() => { setTeamPayroll('250'); setTeamWAR('50'); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
                >
                  <div className="text-yellow-500 font-semibold">Average</div>
                  <div className="text-gray-400 text-xs">Big Market</div>
                </button>
                <button
                  onClick={() => { setTeamPayroll('200'); setTeamWAR('25'); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
                >
                  <div className="text-red-500 font-semibold">Poor</div>
                  <div className="text-gray-400 text-xs">Underperform</div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Calculator Card */}
        <div className="bg-gray-900 rounded-lg p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-800">
          
          {/* Input Fields */}
          {mode === 'individual' ? (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <ContractWARComponents.InputField
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
                <ContractWARComponents.InputField
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
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <ContractWARComponents.InputField
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
                <ContractWARComponents.InputField
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
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 mb-4 md:mb-6">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded font-medium transition-colors uppercase tracking-wider text-sm sm:text-base"
            >
              Calculate
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
              aria-label="Clear form"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors relative"
              aria-label="Show history"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* History Panel */}
          {showHistory && history.length > 0 && (
            <div className="mb-4 md:mb-6 bg-gray-800 rounded p-3 md:p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <h3 className="text-white font-semibold uppercase tracking-wider text-xs sm:text-sm">Recent Calculations</h3>
                <button
                  onClick={handleClearHistory}
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
          )}

          {/* Results Display */}
          {results && (
            results.mode === 'individual' ? 
              <ResultsDisplay results={results} /> : 
              <TeamResultsDisplay results={results} />
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 md:mt-8 text-gray-500 text-xs sm:text-sm">
          <p>League averages based on 2024 MLB data</p>
          <p className="mt-1">Market rate: ~$8M per WAR • League avg team: ~43 WAR</p>
        </div>
      </div>
      
      <PoopConfetti 
        isActive={results && (
          (results.mode === 'individual' && results.warValueCategory === 'Poor Value') ||
          (results.mode === 'team' && results.teamCategory === 'Inefficient')
        )} 
/>
    </div>
  );
};

export default ContractWARCalculator;
