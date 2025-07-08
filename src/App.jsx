import React, { useState, useEffect } from 'react';
import { Calculator, X, History, RefreshCw, Cloud, Share2, Info, Search, Calendar, TrendingUp } from 'lucide-react';
import * as ContractWARComponents from './components/ContractWARComponents';
import ResultsDisplay from './components/ResultsDisplay';
import { 
  calculateContractMetrics, 
  validateInputs, 
  updateURLParams, 
  loadFromURLParams,
  saveHistory,
  loadHistory,
  clearHistory,
  getValueColor,
  getValueLabel 
} from './utils/calculations';
import { PRESET_PLAYERS, LEAGUE_DATA } from './utils/constants';

// Mock data for now - replace with real data later
const MOCK_PLAYER_DATA = {
  'Shohei Ohtani': {
    current: { war: 10.1, salary: 70 },
    seasons: {
      2024: { war: 10.1, salary: 70 },
      2023: { war: 10.0, salary: 30 },
      2022: { war: 9.6, salary: 5.5 }
    },
    career: { totalWAR: 38.7, totalEarnings: 125.5 }
  },
  'Mike Trout': {
    current: { war: 2.3, salary: 35.5 },
    seasons: {
      2024: { war: 2.3, salary: 35.5 },
      2023: { war: 7.2, salary: 35.5 },
      2022: { war: 3.4, salary: 35.5 }
    },
    career: { totalWAR: 85.2, totalEarnings: 292.5 }
  },
  'Mookie Betts': {
    current: { war: 6.8, salary: 30 },
    seasons: {
      2024: { war: 6.8, salary: 30 },
      2023: { war: 8.3, salary: 30 },
      2022: { war: 6.4, salary: 27 }
    },
    career: { totalWAR: 65.5, totalEarnings: 182.3 }
  }
};

const ContractWARCalculator = () => {
  const [mode, setMode] = useState('manual'); // 'manual', 'lookup', 'historical', 'career'
  const [salary, setSalary] = useState('');
  const [war, setWar] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({ salary: '', war: '' });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [showPlayerList, setShowPlayerList] = useState(false);

  useEffect(() => {
    const { salary: urlSalary, war: urlWar } = loadFromURLParams();
    if (urlSalary && urlWar) {
      setSalary(urlSalary);
      setWar(urlWar);
    }

    const savedHistory = loadHistory();
    setHistory(savedHistory);
  }, []);

  const availablePlayers = Object.keys(MOCK_PLAYER_DATA);
  const filteredPlayers = availablePlayers.filter(player => 
    player.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const handleCalculate = () => {
    let salaryValue = salary;
    let warValue = war;
    let playerName = null;

    if (mode === 'lookup' && selectedPlayer) {
      const playerData = MOCK_PLAYER_DATA[selectedPlayer];
      salaryValue = playerData.current.salary.toString();
      warValue = playerData.current.war.toString();
      playerName = selectedPlayer;
    } else if (mode === 'historical' && selectedPlayer && selectedSeason) {
      const playerData = MOCK_PLAYER_DATA[selectedPlayer];
      const seasonData = playerData.seasons[selectedSeason];
      if (seasonData) {
        salaryValue = seasonData.salary.toString();
        warValue = seasonData.war.toString();
        playerName = `${selectedPlayer} (${selectedSeason})`;
      }
    } else if (mode === 'career' && selectedPlayer) {
      const playerData = MOCK_PLAYER_DATA[selectedPlayer];
      salaryValue = playerData.career.totalEarnings.toString();
      warValue = playerData.career.totalWAR.toString();
      playerName = `${selectedPlayer} (Career)`;
    }

    const validation = validateInputs(salaryValue, warValue);
    setErrors(validation.errors);
    
    if (!validation.isValid) {
      return;
    }
    
    const results = calculateContractMetrics(
      parseFloat(salaryValue), 
      parseFloat(warValue), 
      LEAGUE_DATA
    );
    
    // Add context to results
    results.playerName = playerName;
    results.mode = mode;
    results.season = mode === 'historical' ? selectedSeason : null;
    
    setResults(results);
    
    // Add to history
    const historyName = playerName || `${results.playerWAR} WAR @ $${(results.playerSalary / 1000000).toFixed(1)}M`;
    const newEntry = {
      ...results,
      name: historyName,
      date: new Date().toLocaleDateString(),
      category: results.warValueCategory,
      costPerWAR: results.costPerWAR
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    
    if (mode === 'manual') {
      updateURLParams(salaryValue, warValue);
    }
  };

  const handleClear = () => {
    setSalary('');
    setWar('');
    setSelectedPlayer('');
    setPlayerSearch('');
    setResults(null);
    setErrors({ salary: '', war: '' });
    updateURLParams('', '');
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setPlayerSearch(player);
    setShowPlayerList(false);
    
    // Auto-populate if in manual mode
    if (mode === 'manual') {
      const playerData = MOCK_PLAYER_DATA[player];
      setSalary(playerData.current.salary.toString());
      setWar(playerData.current.war.toString());
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
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

        {/* Mode Selector */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setMode('manual')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                mode === 'manual' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setMode('lookup')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                mode === 'lookup' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Current Season
            </button>
            <button
              onClick={() => setMode('historical')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                mode === 'historical' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Past Seasons
            </button>
            <button
              onClick={() => setMode('career')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                mode === 'career' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Career Totals
            </button>
          </div>
        </div>

        {/* Main Calculator Card */}
        <div className="bg-gray-900 rounded-lg p-6 md:p-8 shadow-2xl border border-gray-800">
          
          {/* Player Search (for non-manual modes) */}
          {mode !== 'manual' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Search Player
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={playerSearch}
                  onChange={(e) => {
                    setPlayerSearch(e.target.value);
                    setShowPlayerList(true);
                  }}
                  onFocus={() => setShowPlayerList(true)}
                  placeholder="Type player name..."
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-red-500 transition-colors pl-10"
                />
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                
                {showPlayerList && filteredPlayers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                    {filteredPlayers.map(player => (
                      <button
                        key={player}
                        onClick={() => handlePlayerSelect(player)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors"
                      >
                        {player}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Season Selector (for historical mode) */}
          {mode === 'historical' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Select Season
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          )}

          {/* Input Fields (for manual mode) or Display (for other modes) */}
          {mode === 'manual' ? (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <ContractWARComponents.InputField
                label="Player Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g., 35.5"
                error={errors.salary}
                tooltip="Enter the player's annual salary in millions"
              />
              
              <ContractWARComponents.InputField
                label="Player WAR"
                value={war}
                onChange={(e) => setWar(e.target.value)}
                placeholder="e.g., 5.4"
                error={errors.war}
                tooltip="Wins Above Replacement for the season"
              />
            </div>
          ) : (
            selectedPlayer && MOCK_PLAYER_DATA[selectedPlayer] && (
              <div className="bg-gray-800 rounded p-4 mb-6 border border-gray-700">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{selectedPlayer}</h3>
                  {mode === 'lookup' && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-sm text-gray-400">Current WAR</div>
                        <div className="text-2xl font-bold text-white">
                          {MOCK_PLAYER_DATA[selectedPlayer].current.war}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Current Salary</div>
                        <div className="text-2xl font-bold text-white">
                          ${MOCK_PLAYER_DATA[selectedPlayer].current.salary}M
                        </div>
                      </div>
                    </div>
                  )}
                  {mode === 'historical' && MOCK_PLAYER_DATA[selectedPlayer].seasons[selectedSeason] && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-sm text-gray-400">{selectedSeason} WAR</div>
                        <div className="text-2xl font-bold text-white">
                          {MOCK_PLAYER_DATA[selectedPlayer].seasons[selectedSeason].war}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">{selectedSeason} Salary</div>
                        <div className="text-2xl font-bold text-white">
                          ${MOCK_PLAYER_DATA[selectedPlayer].seasons[selectedSeason].salary}M
                        </div>
                      </div>
                    </div>
                  )}
                  {mode === 'career' && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-sm text-gray-400">Career WAR</div>
                        <div className="text-2xl font-bold text-white">
                          {MOCK_PLAYER_DATA[selectedPlayer].career.totalWAR}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Career Earnings</div>
                        <div className="text-2xl font-bold text-white">
                          ${MOCK_PLAYER_DATA[selectedPlayer].career.totalEarnings}M
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleCalculate}
              disabled={mode !== 'manual' && !selectedPlayer}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-medium transition-colors uppercase tracking-wider disabled:bg-gray-700 disabled:cursor-not-allowed"
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
                  <div
                    key={index}
                    className="p-3 bg-gray-700 rounded"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-medium">{entry.name}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {entry.date} • ${entry.costPerWAR}M per WAR
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${getValueColor(entry.contractEfficiency)}`}>
                        {entry.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && <ResultsDisplay results={results} onShare={() => {}} />}
        </div>
      </div>
    </div>
  );
};

export default ContractWARCalculator;
