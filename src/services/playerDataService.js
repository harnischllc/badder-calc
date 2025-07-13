// © 2024–2025 Harnisch LLC. All rights reserved.
// Player Data Service - Integrates multiple data sources

import mlbApi from './mlbApi';

class PlayerDataService {
  constructor() {
    this.salaryData = new Map(); // Cache for salary data
    this.warData = new Map(); // Cache for WAR data
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Get comprehensive player data
  async getPlayerData(playerId, season = new Date().getFullYear()) {
    try {
      // Get basic player info from MLB API
      const playerInfo = await mlbApi.getPlayerInfo(playerId);
      const player = playerInfo.people[0];

      if (!player) {
        throw new Error('Player not found');
      }

      // Get current season stats
      const hittingStats = await mlbApi.getPlayerStats(playerId, season, 'hitting');
      const pitchingStats = await mlbApi.getPlayerStats(playerId, season, 'pitching');

      // Combine all data
      const playerData = {
        id: player.id,
        name: player.fullName,
        position: player.primaryPosition?.abbreviation || 'Unknown',
        team: player.currentTeam?.name || 'Unknown',
        age: player.currentAge,
        height: player.height,
        weight: player.weight,
        mlbDebut: player.mlbDebutDate,
        stats: {
          hitting: this.extractHittingStats(hittingStats),
          pitching: this.extractPitchingStats(pitchingStats)
        },
        // Placeholder for external data
        salary: null,
        war: null,
        wrcPlus: null
      };

      // Try to get additional data from external sources
      await this.enrichPlayerData(playerData, season);

      return playerData;
    } catch (error) {
      console.error('Error fetching player data:', error);
      throw error;
    }
  }

  // Extract hitting stats from MLB API response
  extractHittingStats(statsData) {
    if (!statsData.stats || statsData.stats.length === 0) {
      return null;
    }

    const splits = statsData.stats[0].splits;
    if (!splits || splits.length === 0) {
      return null;
    }

    const stats = splits[0].stat;
    return {
      games: stats.gamesPlayed || 0,
      atBats: stats.atBats || 0,
      hits: stats.hits || 0,
      doubles: stats.doubles || 0,
      triples: stats.triples || 0,
      homeRuns: stats.homeRuns || 0,
      rbi: stats.rbi || 0,
      runs: stats.runs || 0,
      walks: stats.baseOnBalls || 0,
      strikeouts: stats.strikeOuts || 0,
      stolenBases: stats.stolenBases || 0,
      caughtStealing: stats.caughtStealing || 0,
      avg: parseFloat(stats.avg) || 0,
      obp: parseFloat(stats.obp) || 0,
      slg: parseFloat(stats.slg) || 0,
      ops: parseFloat(stats.ops) || 0,
      babip: parseFloat(stats.babip) || 0
    };
  }

  // Extract pitching stats from MLB API response
  extractPitchingStats(statsData) {
    if (!statsData.stats || statsData.stats.length === 0) {
      return null;
    }

    const splits = statsData.stats[0].splits;
    if (!splits || splits.length === 0) {
      return null;
    }

    const stats = splits[0].stat;
    return {
      games: stats.gamesPlayed || 0,
      gamesStarted: stats.gamesStarted || 0,
      wins: stats.wins || 0,
      losses: stats.losses || 0,
      saves: stats.saves || 0,
      inningsPitched: stats.inningsPitched || 0,
      hits: stats.hits || 0,
      runs: stats.runs || 0,
      earnedRuns: stats.earnedRuns || 0,
      walks: stats.baseOnBalls || 0,
      strikeouts: stats.strikeOuts || 0,
      era: parseFloat(stats.era) || 0,
      whip: parseFloat(stats.whip) || 0,
      strikeoutsPer9: parseFloat(stats.strikeoutsPer9Inn) || 0,
      walksPer9: parseFloat(stats.walksPer9Inn) || 0
    };
  }

  // Enrich player data with external sources
  async enrichPlayerData(playerData, season) {
    try {
      // Get salary data (placeholder for now)
      const salary = await this.getPlayerSalary(playerData.name, season);
      if (salary) {
        playerData.salary = salary;
      }

      // Get WAR data (placeholder for now)
      const war = await this.getPlayerWAR(playerData.name, season);
      if (war) {
        playerData.war = war;
      }

      // Get wRC+ data (placeholder for now)
      const wrcPlus = await this.getPlayerWRCPlus(playerData.name, season);
      if (wrcPlus) {
        playerData.wrcPlus = wrcPlus;
      }
    } catch (error) {
      console.warn('Failed to enrich player data:', error);
    }
  }

  // Placeholder for salary data integration
  async getPlayerSalary(playerName, season) {
    // This would integrate with Spotrac or similar service
    // For now, return null to indicate manual input required
    return null;
  }

  // Placeholder for WAR data integration
  async getPlayerWAR(playerName, season) {
    // This would integrate with FanGraphs or Baseball Reference
    // For now, return null to indicate manual input required
    return null;
  }

  // Placeholder for wRC+ data integration
  async getPlayerWRCPlus(playerName, season) {
    // This would integrate with FanGraphs
    // For now, return null to indicate manual input required
    return null;
  }

  // Search players with enhanced data
  async searchPlayersWithData(query, limit = 10) {
    try {
      const players = await mlbApi.searchPlayers(query, limit);
      
      // For now, return basic player data
      // In the future, this could include salary and WAR estimates
      return players.map(player => ({
        id: player.id,
        name: player.fullName,
        position: player.primaryPosition?.abbreviation || 'Unknown',
        team: player.currentTeam?.name || 'Unknown',
        age: player.currentAge,
        hasSalaryData: false,
        hasWARData: false
      }));
    } catch (error) {
      console.error('Error searching players with data:', error);
      throw error;
    }
  }

  // Get team data with roster
  async getTeamData(teamId, season = new Date().getFullYear()) {
    try {
      const teams = await mlbApi.getTeams(season);
      const team = teams.find(t => t.id === teamId);
      
      if (!team) {
        throw new Error('Team not found');
      }

      const roster = await mlbApi.getTeamRoster(teamId, season);
      
      return {
        id: team.id,
        name: team.name,
        abbreviation: team.abbreviation,
        division: team.division?.name,
        league: team.league?.name,
        roster: roster.roster || []
      };
    } catch (error) {
      console.error('Error fetching team data:', error);
      throw error;
    }
  }

  // Get league averages for comparison
  async getLeagueAverages(season = new Date().getFullYear()) {
    // This would fetch league-wide statistics
    // For now, return static data
    return {
      avgBattingAvg: 0.248,
      avgOBP: 0.320,
      avgSLG: 0.414,
      avgERA: 4.33,
      avgWHIP: 1.30
    };
  }

  // Clear all caches
  clearCache() {
    this.salaryData.clear();
    this.warData.clear();
    mlbApi.clearCache();
  }
}

export default new PlayerDataService(); 