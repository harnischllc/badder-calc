import React, { useState, useEffect } from 'react';
import { Calculator, X, History, RefreshCw, Cloud, Share2, Info, Search, Calendar, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
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
import { loadHistoricalData, searchPlayers } from './data/dataProcessor';
import { fetchCurrentSeasonFromSheets } from './services/googleSheetsApi';

const ContractWARCalculator = () => {
  const [mode, setMode] = useState('manual');
  const [salary, setSalary] = useState('');
  const [war, setWar] = useState('');
  const [warType, setWarType] = useState('avg'); // 'fWAR', 'bWAR', 'avg'
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({ salary: '', war: '' });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [showPlayerList, setShowPlayerList] = useState(false);
  
  // Data states
  const [historicalData, setHistoricalData] = useState(null);
  const [currentSeasonData, setCurrentSeasonData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setDataLoading(true);
      
      // Load historical data
      const historical = await loadHistoricalData();
      setHistoricalData(historical);
      
      // Load current season from Google Sheets
      const current = await fetchCurrentSeasonFromSheets();
      setCurrentSeasonData(current);
      
      setDataLoading(false);
    }
    
    loadData();
    
    // Load URL params and history
    const { salary: urlSalary, war: urlWar } = loadFromURLParams();
    if (urlSalary && urlWar) {
      setSalary(urlSalary);
      setWar(urlWar);
    }
    
    const savedHistory = loadHistory();
    setHistory(savedHistory);
  }, []);

  // Search players as user types
  useEffect(() => {
    if (playerSearch && historicalData) {
      const results = searchPlayers(playerSearch, historicalData);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [playerSearch, historicalData]);

  const handleCalculate = () => {
    let salaryValue = salary;
    let warValue = war;
    let playerName = null;

    if (mode === 'lookup' && selectedPlayer && currentSeasonData) {
      const playerData = currentSeasonData.players[selectedPlayer];
      if (playerData) {
        salaryValue = playerData.salary.toString();
        warValue = getWARByType(playerData).toString();
        playerName = selectedPlayer;
      }
    } else if (mode === 'historical' && selectedPlayer && historicalData) {
      const playerData = historicalData[selectedPlayer];
      if (playerData && playerData.seasons[selectedSeason]) {
        const seasonData = playerData.seasons[selectedSeason];
        salaryValue = (seasonData.salary / 1000000).toString() || '0';
        warValue = getWARByType(seasonData).toString();
        playerName = `${selectedPlayer} (${selectedSeason})`;
      }
    } else if (mode === 'career' && selectedPlayer && historicalData) {
      const playerData = historicalData[selectedPlayer];
      if (playerData) {
        salaryValue = (playerData.career.totalEarnings / 1000000).toString() || '0';
        warValue = playerData.career.totalWAR.toString();
        playerName = `${selectedPlayer} (Career)`;
      }
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
    
    results.playerName = playerName;
    results.mode = mode;
    results.season = mode === 'historical' ? selectedSeason : null;
    results.warType = warType;
    
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

  const getWARByType = (data) => {
    switch (warType) {
      case 'fWAR':
        return data.fWAR || 0;
      case 'bWAR':
        return data.bWAR || 0;
      case 'avg':
      default:
        return data.avgWAR || ((data.fWAR + data.bWAR) / 2) || 0;
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

  const handlePlayerSelect = (playerName) => {
    setSelectedPlayer(playerName);
    setPlayerSearch(playerName);
    setShowPlayerList(false);
    setSearchResults([]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    clearHistory();
  };

  const refreshCurrentData = async () => {
    setDataLoading(true);
    const current = await fetchCurrentSeasonFromSheets();
    setCurrentSeasonData(current);
    setDataLoading(false);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading MLB data...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-500 text-sm mt-2">
            Historical data: 1976-2024 | Current: {currentSeasonData?.season || '2025'}
          </p>
        </div>

        {/* WAR Type Toggle */}
        <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800">
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
              className={`px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === 'lookup' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Current Season
              <Cloud className="w-4 h-4" />
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
                
                {showPlayerList && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(player => (
                      <button
                        key={player.name}
                        onClick={() => handlePlayerSelect(player.name)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex justify-between items-center"
                      >
                        <span>{player.name}</span>
                        <span className="text-sm text-gray-400">
                          {player.latestYear} • {player.latestWAR.toFixed(1)} WAR
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {mode === 'lookup' && (
                <button
                  onClick={refreshCurrentData}
                  className="mt-2 text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh from Google Sheets
                </button>
              )}
            </div>
          )}

          {/* Season Selector (for historical mode) */}
          {mode === 'historical' && selectedPlayer && historicalData[selectedPlayer] && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Select Season
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
              >
                {Object.keys(historicalData[selectedPlayer].seasons)
                  .sort((a, b) => b - a)
                  .map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))
                }
              </select>
            </div>
          )}

          {/* Input Fields (for manual mode) */}
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
                label={`Player ${warType === 'avg' ? 'WAR' : warType}`}
                value={war}
                onChange={(e) => setWar(e.target.value)}
                placeholder="e.g., 5.4"
                error={errors.war}
                tooltip={`Wins Above Replacement (${warType})`}
              />
            </div>
          ) : (
            selectedPlayer && (
              <div className="bg-gray-800 rounded p-4 mb-6 border border-gray-700">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{selectedPlayer}</h3>
                  {renderPlayerDisplay()}
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
                  <div key={index} className="p-3 bg-gray-700 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-medium">{entry.name}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {entry.date} • ${entry.costPerWAR}M per WAR • {entry.warType || 'avg'}
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
          {results && <ResultsDisplay results={results} />}
        </div>
      </div>
    </div>
  );

  function renderPlayerDisplay() {
    if (mode === 'lookup' && currentSeasonData?.players[selectedPlayer]) {
      const data = currentSeasonData.players[selectedPlayer];
      return (
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <div className="text-sm text-gray-400">{warType} (2025)</div>
            <div className="text-2xl font-bold text-white">
              {getWARByType(data).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">2025 Salary</div>
            <div className="text-2xl font-bold text-white">
              ${data.salary}M
            </div>
          </div>
        </div>
      );
    }
    
    if (mode === 'historical' && historicalData[selectedPlayer]?.seasons[selectedSeason]) {
      const data = historicalData[selectedPlayer].seasons[selectedSeason];
      return (
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <div className="text-sm text-gray-400">{warType} ({selectedSeason})</div>
            <div className="text-2xl font-bold text-white">
              {getWARByType(data).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">{selectedSeason} Salary</div>
            <div className="text-2xl font-bold text-white">
              ${data.salary ? (data.salary / 1000000).toFixed(1) : '?'}M
            </div>
          </div>
        </div>
      );
    }
    
    if (mode === 'career' && historicalData[selectedPlayer]) {
      const data = historicalData[selectedPlayer].career;
      return (
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <div className="text-sm text-gray-400">Career WAR</div>
            <div className="text-2xl font-bold text-white">
              {data.totalWAR.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Career Earnings</div>
            <div className="text-2xl font-bold text-white">
              ${data.totalEarnings ? (data.totalEarnings / 1000000).toFixed(1) : '?'}M
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  }
};

export default ContractWARCalculator;
