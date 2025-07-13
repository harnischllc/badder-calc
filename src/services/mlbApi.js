// © 2024–2025 Harnisch LLC. All rights reserved.
// MLB API Service for fetching player and team data

const MLB_BASE_URL = 'https://statsapi.mlb.com/api/v1';

class MLBApiService {
  constructor() {
    this.baseUrl = MLB_BASE_URL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fetch teams
  async getTeams(season = new Date().getFullYear()) {
    const cacheKey = `teams_${season}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/teams?season=${season}`);
      const data = await response.json();
      
      // Filter for MLB teams only
      const mlbTeams = data.teams.filter(team => 
        team.sport.id === 1 && team.active
      );
      
      this.setCachedData(cacheKey, mlbTeams);
      return mlbTeams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  // Search players
  async searchPlayers(query, limit = 10) {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/people?search=${encodeURIComponent(query)}&limit=${limit}`);
      const data = await response.json();
      
      // Filter for active MLB players
      const activePlayers = data.people.filter(person => 
        person.active && person.isPlayer
      );
      
      this.setCachedData(cacheKey, activePlayers);
      return activePlayers;
    } catch (error) {
      console.error('Error searching players:', error);
      throw error;
    }
  }

  // Get player stats
  async getPlayerStats(playerId, season = new Date().getFullYear(), group = 'hitting') {
    const cacheKey = `stats_${playerId}_${season}_${group}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/people/${playerId}/stats?stats=season&season=${season}&group=${group}`
      );
      const data = await response.json();
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  }

  // Get player info
  async getPlayerInfo(playerId) {
    const cacheKey = `player_${playerId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/people/${playerId}`);
      const data = await response.json();
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching player info:', error);
      throw error;
    }
  }

  // Get team roster
  async getTeamRoster(teamId, season = new Date().getFullYear()) {
    const cacheKey = `roster_${teamId}_${season}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/teams/${teamId}/roster?season=${season}`);
      const data = await response.json();
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching team roster:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }
}

export default new MLBApiService(); 