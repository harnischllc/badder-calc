import React, { useState, useEffect } from 'react';
import { ExternalLink, User, Loader2, AlertCircle } from 'lucide-react';
import PlayerSearch from './PlayerSearch';
import { InputField } from './ContractWARComponents';
import playerDataService from '../services/playerDataService';

const EnhancedCalculatorForm = ({ 
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
  errors,
  selectedPlayer,
  setSelectedPlayer
}) => {
  const [playerData, setPlayerData] = useState(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [playerError, setPlayerError] = useState('');
  const [playerFullData, setPlayerFullData] = useState(null); // store full backend response
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  // Load player data when a player is selected
  useEffect(() => {
    if (selectedPlayer?.id) {
      loadPlayerData(selectedPlayer.id);
    } else {
      setPlayerData(null);
      setPlayerFullData(null);
      setAvailableYears([]);
      setSelectedYear(null);
    }
  }, [selectedPlayer]);

  const loadPlayerData = async (playerId) => {
    setLoadingPlayer(true);
    setPlayerError('');

    try {
      // Fetch full backend response for year selection
      const url = `http://localhost:4000/api/players/${playerId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('API error');
      const backendData = await response.json();
      setPlayerFullData(backendData);

      // Expand contract years to all years covered by each contract
      let contractYears = [];
      if (backendData.contracts) {
        backendData.contracts.forEach(c => {
          if (c.contract_start && c.contract_end) {
            for (let y = c.contract_start; y <= c.contract_end; y++) {
              contractYears.push(y);
            }
          }
        });
      }
      // Only include years with stats (fangraphs or statcast)
      const fgYears = backendData.fangraphs_history?.map(fg => fg.season) || [];
      const statcastYears = backendData.statcast_history?.map(sc => sc.season) || [];
      const years = Array.from(new Set([...fgYears, ...statcastYears])).filter(Boolean).sort((a, b) => b - a);
      setAvailableYears(years);
      setSelectedYear(years[0] || null);

      // Default to most recent year for initial display
      const playerInfo = await playerDataService.getPlayerInfo(playerId);
      const playerStats = await playerDataService.getPlayerStats(playerId);
      const player = playerInfo.people[0] || {};
      const stats = (playerStats && playerStats.stats && playerStats.stats[0]) || { stats: [] };
      const getStat = (name) => {
        const statObj = stats.stats.find(s => s.name === name);
        return statObj && statObj.value !== undefined && statObj.value !== null ? statObj.value : null;
      };
      const data = {
        id: player.id || '',
        name: player.fullName || 'Unknown',
        position: player.primaryPosition?.abbreviation || 'Unknown',
        team: player.currentTeam?.name || 'Unknown',
        age: player.currentAge || null, // Not available in our data
        stats: {
          hitting: {
            avg: getStat('avg') ?? 0,
            ops: (getStat('obp') ?? 0) + (getStat('slg') ?? 0),
            homeRuns: getStat('hrs') ?? 0,
            obp: getStat('obp') ?? 0,
            slg: getStat('slg') ?? 0
          },
          pitching: null // We only have hitting data
        }
      };
      setPlayerData(data);
    } catch (error) {
      setPlayerError('Failed to load player data. Please try again.');
      setPlayerFullData(null);
      setAvailableYears([]);
      setSelectedYear(null);
      console.error('Error loading player data:', error);
    } finally {
      setLoadingPlayer(false);
    }
  };

  // Auto-fill WAR and salary when year or player changes
  useEffect(() => {
    if (playerFullData && selectedYear) {
      // Find WAR for the selected year (prefer fangraphs, fallback statcast)
      const fg = playerFullData.fangraphs_history?.find(fg => fg.season === selectedYear);
      const sc = playerFullData.statcast_history?.find(sc => sc.season === selectedYear);
      setWar(fg?.war !== undefined && fg?.war !== null ? Number(fg.war) : (sc?.war !== undefined && sc?.war !== null ? Number(sc.war) : ''));
      // Find salary for the selected year (contract covering the year)
      const contract = playerFullData.contracts?.find(
        c => c.contract_start <= selectedYear && c.contract_end >= selectedYear
      );
      setSalary(contract?.aav !== undefined && contract?.aav !== null ? (Number(contract.aav) / 1_000_000).toFixed(1) : '');
      // Update playerData.stats for the selected year
      setPlayerData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          stats: {
            hitting: {
              avg: fg?.avg ?? sc?.ba ?? 0,
              ops: (fg?.obp ?? 0) + (fg?.slg ?? 0) || ((sc?.obp ?? 0) + (sc?.slg ?? 0)),
              homeRuns: fg?.home_runs ?? sc?.home_runs ?? 0,
              obp: fg?.obp ?? sc?.obp ?? 0,
              slg: fg?.slg ?? sc?.slg ?? 0
            },
            pitching: null
          }
        };
      });
    }
  }, [playerFullData, selectedYear, setWar, setSalary]);

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setPlayerError('');
  };

  const clearPlayerSelection = () => {
    setSelectedPlayer(null);
    setPlayerData(null);
    setPlayerError('');
  };

  if (mode === 'individual') {
    return (
      <div className="space-y-6 mb-6">
        {/* Player Search */}
        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Player Selection
          </label>
          
          {!selectedPlayer ? (
            <PlayerSearch 
              onPlayerSelect={handlePlayerSelect}
              placeholder="Search for a player (e.g., Mike Trout, Aaron Judge)..."
            />
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-900 rounded border border-gray-600">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-gray-400" />
                <div>
                  <div className="text-white font-medium">{selectedPlayer.fullName}</div>
                  <div className="text-sm text-gray-400">
                    {selectedPlayer.primaryPosition?.name}
                  </div>
                </div>
              </div>
              <button
                onClick={clearPlayerSelection}
                className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4 rotate-45" />
                <span className="text-xs">(Clear selection)</span>
              </button>
            </div>
          )}

          {/* Player Data Display */}
          {selectedPlayer && (
            <div className="mt-4">
              {/* Year Selector */}
              {availableYears.length > 0 && (
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">Year</label>
                  <select
                    value={selectedYear || ''}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
              {loadingPlayer ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading player data...
                </div>
              ) : playerError ? (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {playerError}
                </div>
              ) : playerData ? (
                <div className="bg-gray-900 rounded p-3 border border-gray-600">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {playerData.stats.hitting && (
                      <>
                        <div>
                          <div className="text-gray-400">AVG</div>
                          <div className="text-white font-medium">
                            {Number(playerData.stats.hitting.avg) ? Number(playerData.stats.hitting.avg).toFixed(3) : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">OPS</div>
                          <div className="text-white font-medium">
                            {Number(playerData.stats.hitting.ops) ? Number(playerData.stats.hitting.ops).toFixed(3) : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">OBP</div>
                          <div className="text-white font-medium">
                            {Number(playerData.stats.hitting.obp) ? Number(playerData.stats.hitting.obp).toFixed(3) : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">SLG</div>
                          <div className="text-white font-medium">
                            {Number(playerData.stats.hitting.slg) ? Number(playerData.stats.hitting.slg).toFixed(3) : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">HR</div>
                          <div className="text-white font-medium">
                            {Number(playerData.stats.hitting.homeRuns) || 0}
                          </div>
                        </div>
                      </>
                    )}
                    {playerData.stats.pitching && (
                      <>
                        <div>
                          <div className="text-gray-400">ERA</div>
                          <div className="text-white font-medium">
                            {playerData.stats.pitching.era.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">WHIP</div>
                          <div className="text-white font-medium">
                            {playerData.stats.pitching.whip.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">W-L</div>
                          <div className="text-white font-medium">
                            {playerData.stats.pitching.wins}-{playerData.stats.pitching.losses}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">IP</div>
                          <div className="text-white font-medium">
                            {playerData.stats.pitching.inningsPitched}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Position: {playerData.position}</span>
                      <span>Age: {playerData.age}</span>
                    </div>
                    {(war === '' || salary === '') && (
                      <div className="mt-1 text-yellow-500">
                        ⚠️ Salary and WAR data require manual input below
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Manual Input Fields */}
        <div className="grid md:grid-cols-2 gap-6">
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
      </div>
    );
  }
  
  if (mode === 'wrcplus') {
    return (
      <div className="space-y-6 mb-6">
        {/* Player Search */}
        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Player Selection
          </label>
          
          {!selectedPlayer ? (
            <PlayerSearch 
              onPlayerSelect={handlePlayerSelect}
              placeholder="Search for a hitter (e.g., Aaron Judge, Freddie Freeman)..."
            />
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-900 rounded border border-gray-600">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-gray-400" />
                <div>
                  <div className="text-white font-medium">{selectedPlayer.fullName}</div>
                  <div className="text-sm text-gray-400">
                    {selectedPlayer.primaryPosition?.name} • {selectedPlayer.currentTeam?.name || 'Unknown Team'}
                  </div>
                </div>
              </div>
              <button
                onClick={clearPlayerSelection}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <ExternalLink className="h-4 w-4 rotate-45" />
              </button>
            </div>
          )}

          {/* Player Data Display */}
          {selectedPlayer && playerData && (
            <div className="mt-4">
              <div className="bg-gray-900 rounded p-3 border border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400">AVG</div>
                    <div className="text-white font-medium">
                      {playerData.stats.hitting?.avg.toFixed(3) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">OBP</div>
                    <div className="text-white font-medium">
                      {playerData.stats.hitting?.obp.toFixed(3) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">SLG</div>
                    <div className="text-white font-medium">
                      {playerData.stats.hitting?.slg.toFixed(3) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">OPS</div>
                    <div className="text-white font-medium">
                      {playerData.stats.hitting?.ops.toFixed(3) || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Position: {playerData.position}</span>
                    <span>Age: {playerData.age}</span>
                    <span>Team: {playerData.team}</span>
                  </div>
                  <div className="mt-1 text-yellow-500">
                    ⚠️ Salary and wRC+ data require manual input below
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manual Input Fields */}
        <div className="grid md:grid-cols-2 gap-6">
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
      </div>
    );
  }

  // Team mode (unchanged)
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
              onChange={(e) => setPayrollType(e.target.value)}
              className="mr-2 text-red-500"
            />
            <span className="text-white">Active Payroll</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {payrollType === 'total' 
            ? 'Includes injured list and retained salary'
            : 'Only players on active roster'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <InputField
            label={`${payrollType === 'total' ? 'Total' : 'Active'} Payroll ($M)`}
            value={teamPayroll}
            onChange={(e) => setTeamPayroll(e.target.value)}
            placeholder="e.g., 150"
            error={errors.teamPayroll}
            tooltip={`Enter the team's ${payrollType} payroll in millions`}
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
            label="Team WAR (Current Season)"
            value={teamWAR}
            onChange={(e) => setTeamWAR(e.target.value)}
            placeholder="e.g., 45"
            error={errors.teamWAR}
            tooltip="Combined WAR for all players to date"
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
    </div>
  );
};

export default EnhancedCalculatorForm; 