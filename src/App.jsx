import React, { useState, useEffect } from 'react';
import { Calculator, X, History, RefreshCw, Cloud, Share2, Info } from 'lucide-react';
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

// Data Loader Service
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/harnischllc/contract-war-calculator/main/src/data/mlbData.json';
const CACHE_KEY = 'mlb_data_cache';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

class MLBDataLoader {
  constructor() {
    this.data = null;
    this.lastFetch = null;
  }

  isCacheValid() {
    if (!this.lastFetch) return false;
    return Date.now() - this.lastFetch < CACHE_DURATION;
  }

  async loadFromGitHub() {
    try {
      const response = await fetch(GITHUB_RAW_URL, {
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Successfully loaded MLB data from GitHub');
      return data;
    } catch (error) {
      console.error('Failed to load from GitHub:', error);
      throw error;
    }
  }

  loadFromCache() {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.data = parsed.data;
        this.lastFetch = parsed.timestamp;
        console.log('Loaded MLB data from cache');
        return this.data;
      }
    } catch (error) {
      console.error('Cache load error:', error);
    }
    return null;
  }

  saveToCache(data) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      this.data = data;
      this.lastFetch = cacheData.timestamp;
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  getDefaultData() {
    return {
      leagueData: LEAGUE_DATA,
      presetPlayers: PRESET_PLAYERS,
      lastUpdated: new Date().toISOString()
    };
  }

  async getData(forceRefresh = false) {
    // Check cache first unless forced refresh
    if (!forceRefresh && this.isCacheValid()) {
      return this.data;
    }

    // Try to load from cache
    const cachedData = this.loadFromCache();
    if (cachedData && !forceRefresh) {
      return cachedData;
    }

    // Try to load from GitHub
    try {
      const githubData = await this.loadFromGitHub();
      this.saveToCache(githubData);
      return githubData;
    } catch (error) {
      // Fall back to cached data if available
      if (cachedData) {
        console.log('Using cached data due to GitHub error');
        return cachedData;
      }
      
      // Last resort: use default data
      console.log('Using default data');
      return this.getDefaultData();
    }
  }

  getDataStatus() {
    if (!this.lastFetch) {
      return { isCloud: false, age: null, ageText: 'Using default data' };
    }

    const ageMs = Date.now() - this.lastFetch;
    const ageMinutes = Math.floor(ageMs / 60000);
    const ageHours = Math.floor(ageMinutes / 60);
    
    if (ageHours >= 24) {
      const ageDays = Math.floor(ageHours / 24);
      return { isCloud: true, age: ageMs, ageText: `${ageDays} day${ageDays !== 1 ? 's' : ''} ago` };
    } else if (ageHours > 0) {
      return { isCloud: true, age: ageMs, ageText: `${ageHours} hour${ageHours !== 1 ? 's' : ''} ago` };
    } else {
      return { isCloud: true, age: ageMs, ageText: `${ageMinutes} minute${ageMinutes !== 1 ? 's' : ''} ago` };
    }
  }
}

const mlbDataLoader = new MLBDataLoader();

// Main Component
const ContractWARCalculator = () => {
  const [salary, setSalary] = useState('');
  const [war, setWar] = useState('');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({ salary: '', war: '' });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [mlbData, setMlbData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState(null);

  useEffect(() => {
    async function initialize() {
      try {
        setDataLoading(true);
        const data = await mlbDataLoader.getData();
        setMlbData(data);
        setDataStatus(mlbDataLoader.getDataStatus());
      } catch (error) {
        console.error('Failed to load MLB data:', error);
        const defaultData = mlbDataLoader.getDefaultData();
        setMlbData(defaultData);
      } finally {
        setDataLoading(false);
      }
    }

    initialize();

    const { salary: urlSalary, war: urlWar } = loadFromURLParams();
    if (urlSalary && urlWar) {
      setSalary(urlSalary);
      setWar(urlWar);
    }

    const savedHistory = loadHistory();
    setHistory(savedHistory);
  }, []);

  const handleRefreshData = async () => {
    setDataLoading(true);
    try {
      const data = await mlbDataLoader.getData(true);
      setMlbData(data);
      setDataStatus(mlbDataLoader.getDataStatus());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleCalculate = () => {
    const validation = validateInputs(salary, war);
    setErrors(validation.errors);
    
    if (!validation.isValid) {
      return;
    }
    
    const leagueData = mlbData?.leagueData || LEAGUE_DATA;
    const results = calculateContractMetrics(parseFloat(salary), parseFloat(war), leagueData);
    setResults(results);
    
    // Add to history
    const newEntry = {
      ...results,
      name: `${results.playerWAR} WAR @ $${(results.playerSalary / 1000000).toFixed(1)}M`,
      date: new Date().toLocaleDateString(),
      // Include new metrics in history
      category: results.warValueCategory,
      costPerWAR: results.costPerWAR
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    
    updateURLParams(salary, war);
  };

  const handlePresetPlayer = (player) => {
    setSalary(player.salary.toString());
    setWar(player.war.toString());
    setErrors({ salary: '', war: '' });
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

  const handleSelectHistory = (entry) => {
    setSalary((entry.playerSalary / 1000000).toString());
    setWar(entry.playerWAR.toString());
    setErrors({ salary: '', war: '' });
    setShowHistory(false);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading MLB data...</span>
        </div>
      </div>
    );
  }

  const presetPlayers = mlbData?.presetPlayers || PRESET_PLAYERS;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
            Built for BadderSports.com
          </p>
          
          {/* Cloud Status */}
          {dataStatus && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <Cloud className={`w-4 h-4 ${dataStatus.isCloud ? 'text-green-500' : 'text-gray-500'}`} />
              <span className="text-gray-400">
                {dataStatus.isCloud ? `Cloud data updated ${dataStatus.ageText}` : dataStatus.ageText}
              </span>
              <button
                onClick={handleRefreshData}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
                aria-label="Refresh data"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Main Calculator Card */}
        <div className="bg-gray-900 rounded-lg p-6 md:p-8 shadow-2xl border border-gray-800">
          {/* Preset Players */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Quick Examples
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {presetPlayers.map((player) => (
                <button
                  key={player.name}
                  onClick={() => handlePresetPlayer(player)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-colors border border-gray-700 hover:border-red-500"
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
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
                  <div
                    key={index}
                    onClick={() => handleSelectHistory(entry)}
                    className="p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-medium">{entry.name}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {entry.date} • {entry.contractEfficiency}x efficiency
                        </div>
                        {entry.costPerWAR && (
                          <div className="text-gray-400 text-xs">
                            ${entry.costPerWAR}M per WAR • {entry.category}
                          </div>
                        )}
                      </div>
                      <div className={`text-sm font-medium ${getValueColor(entry.contractEfficiency)}`}>
                        {getValueLabel(entry.contractEfficiency)}
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
