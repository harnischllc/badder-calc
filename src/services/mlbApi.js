// © 2024–2025 Harnisch LLC. All rights reserved.
// MLB API Service for fetching player and team data

// Use CORS proxy for browser compatibility
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
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
      const url = `${this.baseUrl}/teams?season=${season}`;
      const proxiedUrl = CORS_PROXY + encodeURIComponent(url);
      const response = await fetch(proxiedUrl);
      if (!response.ok) {
        const text = await response.text();
        console.error('Non-OK response:', response.status, text);
        throw new Error(`API error: ${response.status}`);
      }
      const proxyData = await response.json();
      const data = JSON.parse(proxyData.contents);
      // Filter for MLB teams only
      const mlbTeams = (data.teams || []).filter(team => 
        team.sport.id === 1 && team.active
      );
      this.setCachedData(cacheKey, mlbTeams);
      return mlbTeams;
    } catch (error) {
      console.error('getTeams error:', error);
      throw new Error(`Teams fetch failed: ${error.message}`);
    }
  }

  // Search players
  async searchPlayers(query, limit = 10) {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/people?search=${encodeURIComponent(query)}&limit=${limit}`;
      const proxiedUrl = CORS_PROXY + encodeURIComponent(url);
      const response = await fetch(proxiedUrl);
      if (!response.ok) {
        const text = await response.text();
        console.error('Non-OK response:', response.status, text);
        throw new Error(`API error: ${response.status}`);
      }
      const proxyData = await response.json();
      let data;
      try {
        data = JSON.parse(proxyData.contents);
      } catch (parseErr) {
        console.error('Failed to parse proxy contents:', proxyData.contents);
        throw new Error('Invalid proxy response');
      }
      console.log('searchPlayers MLB data:', data);
      // Defensive: if no people array, return empty
      const people = Array.isArray(data.people) ? data.people : [];
      // Filter for active MLB players
      const activePlayers = people.filter(person => 
        person.active && person.isPlayer
      );
      this.setCachedData(cacheKey, activePlayers);
      return activePlayers;
    } catch (error) {
      console.error('searchPlayers error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  // Get player stats
  async getPlayerStats(playerId, season = new Date().getFullYear(), group = 'hitting') {
    const cacheKey = `stats_${playerId}_${season}_${group}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/people/${playerId}/stats?stats=season&season=${season}&group=${group}`;
      const proxiedUrl = CORS_PROXY + encodeURIComponent(url);
      const response = await fetch(proxiedUrl);
      if (!response.ok) {
        const text = await response.text();
        console.error('Non-OK response:', response.status, text);
        throw new Error(`API error: ${response.status}`);
      }
      const proxyData = await response.json();
      let data;
      try {
        data = JSON.parse(proxyData.contents);
      } catch (parseErr) {
        console.error('Failed to parse proxy contents:', proxyData.contents);
        throw new Error('Invalid proxy response');
      }
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('getPlayerStats error:', error);
      throw new Error(`Player stats fetch failed: ${error.message}`);
    }
  }

  // Get player info
  async getPlayerInfo(playerId) {
    const cacheKey = `player_${playerId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/people/${playerId}`;
      const proxiedUrl = CORS_PROXY + encodeURIComponent(url);
      const response = await fetch(proxiedUrl);
      if (!response.ok) {
        const text = await response.text();
        console.error('Non-OK response:', response.status, text);
        throw new Error(`API error: ${response.status}`);
      }
      const proxyData = await response.json();
      let data;
      try {
        data = JSON.parse(proxyData.contents);
      } catch (parseErr) {
        console.error('Failed to parse proxy contents:', proxyData.contents);
        throw new Error('Invalid proxy response');
      }
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('getPlayerInfo error:', error);
      throw new Error(`Player info fetch failed: ${error.message}`);
    }
  }

  // Get team roster
  async getTeamRoster(teamId, season = new Date().getFullYear()) {
    const cacheKey = `roster_${teamId}_${season}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/teams/${teamId}/roster?season=${season}`;
      const proxiedUrl = CORS_PROXY + encodeURIComponent(url);
      const response = await fetch(proxiedUrl);
      if (!response.ok) {
        const text = await response.text();
        console.error('Non-OK response:', response.status, text);
        throw new Error(`API error: ${response.status}`);
      }
      const proxyData = await response.json();
      let data;
      try {
        data = JSON.parse(proxyData.contents);
      } catch (parseErr) {
        console.error('Failed to parse proxy contents:', proxyData.contents);
        throw new Error('Invalid proxy response');
      }
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('getTeamRoster error:', error);
      throw new Error(`Team roster fetch failed: ${error.message}`);
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