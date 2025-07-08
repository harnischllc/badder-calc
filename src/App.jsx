import React, { useState, useEffect } from 'react';
import { Calculator, X, History, ExternalLink } from 'lucide-react';
import * as ContractWARComponents from './components/ContractWARComponents';
import ResultsDisplay from './components/ResultsDisplay';
import { 
  calculateContractMetrics, 
  validateInputs, 
  updateURLParams, 
  loadFromURLParams,
  saveHistory,
  loadHistory,
  clearHistory
} from './utils/calculations';
import { LEAGUE_DATA } from './utils/constants';

const ContractWARCalculator = () => {
  const [salary, setSalary] = useState('');
  const [war, setWar] = useState('');
  const [warType, setWarType] = useState('avg'); // 'fWAR', 'bWAR', 'avg'
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({ salary: '', war: '' });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load URL params and history on mount
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
    const validation = validateInputs(salary, war);
    setErrors(validation.errors);
    
    if (!validation.isValid) {
      return;
    }
    
    const results = calculateContractMetrics(
      parseFloat(salary), 
      parseFloat(war), 
      LEAGUE_DATA
    );
    
    results.warType = warType;
    
    setResults(results);
    
    // Add to history
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
  };

  const handleClear = () => {
    setSalary('');
    setWar('');
    setResults(null);
    setErrors({ salary: '', war: '' });
    updateURLParams('', '');
  };

  const handleClearHistory = () => {
    setHistory([]);
    clearHistory();
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Historic Bargain':
        return 'text-purple-500';
      case 'High Value':
        return 'text-green-500';
      case 'Average':
        return 'text-yellow-500';
      case 'Poor Value':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">
              Contract WAR Calculator
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Analyze MLB player contracts from a performance vs. salary perspective
          </p>
        </div>

        {/* WAR Type Toggle */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
          <div className="flex items-center justify-center gap-4">
            <span className="text-gray-400 text-sm uppercase tracking-wider">WAR Type:</span>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setWarType('fWAR')}
                className={`px-4 py-2 rounded transition-colors ${
                  warType === 'fWAR' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                fWAR
              </button>
              <button
                onClick={() => setWarType('avg')}
                className={`px-4 py-2 rounded transition-colors ${
                  warType === 'avg' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Average
              </button>
              <button
                onClick={() => setWarType('bWAR')}
                className={`px-4 py-2 rounded transition-colors ${
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

        {/* Main Calculator Card */}
        <div className="bg-gray-900 rounded-lg p-6 md:p-8 shadow-2xl border border-gray-800">
          
          {/* Input Fields */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <ContractWARComponents.InputField
                label="Player Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g., 35.5"
                error={errors.salary}
                tooltip="Enter the player's annual salary in millions"
              />
              <a
                href="https://www.spotrac.com/mlb/contracts/"
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
                <a
                  href="https://www.fangraphs.com/leaders/war"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  fWAR
                </a>
                <a
                  href="https://www.baseball-reference.com/leagues/AL/2024-WAR-leaders.shtml"
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

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-medium transition-colors uppercase tracking-wider"
            >
              Calculate Value
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
              aria-label="Clear form"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors relative"
              aria-label="Show history"
            >
              <History className="w-5 h-5" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* History Panel */}
          {showHistory && history.length > 0 && (
            <div className="mb-6 bg-gray-800 rounded p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-semibold uppercase tracking-wider text-sm">Recent Calculations</h3>
                <button
                  onClick={handleClearHistory}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((entry, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-medium">{entry.name}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {entry.date} • ${entry.costPerWAR}M per WAR
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && <ResultsDisplay results={results} />}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>League averages based on 2024 MLB data</p>
          <p className="mt-1">Market rate: ~$8M per WAR</p>
        </div>
      </div>
    </div>
  );
};

export default ContractWARCalculator;
