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

  // Load player data when a player is selected
  useEffect(() => {
    if (selectedPlayer?.id) {
      loadPlayerData(selectedPlayer.id);
    } else {
      setPlayerData(null);
    }
  }, [selectedPlayer]);

  const loadPlayerData = async (playerId) => {
    setLoadingPlayer(true);
    setPlayerError('');

    try {
      const data = await playerDataService.getPlayerData(playerId);
      setPlayerData(data);
    } catch (error) {
      setPlayerError('Failed to load player data. Please try again.');
      console.error('Error loading player data:', error);
    } finally {
      setLoadingPlayer(false);
    }
  };

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
          {selectedPlayer && (
            <div className="mt-4">
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
                            {playerData.stats.hitting.avg.toFixed(3)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">OPS</div>
                          <div className="text-white font-medium">
                            {playerData.stats.hitting.ops.toFixed(3)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">HR</div>
                          <div className="text-white font-medium">
                            {playerData.stats.hitting.homeRuns}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Games</div>
                          <div className="text-white font-medium">
                            {playerData.stats.hitting.games}
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
                      <span>Team: {playerData.team}</span>
                    </div>
                    <div className="mt-1 text-yellow-500">
                      ⚠️ Salary and WAR data require manual input below
                    </div>
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