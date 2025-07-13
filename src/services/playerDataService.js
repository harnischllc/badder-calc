// © 2024–2025 Harnisch LLC. All rights reserved.
// Player Data Service for fetching data from local backend API

const BACKEND_BASE_URL = 'https://badder-calc-backend.onrender.com/api';

class PlayerDataService {
  constructor() {
    this.baseUrl = BACKEND_BASE_URL;
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

  // Search players from local database
  async searchPlayers(query, limit = 10) {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/players?name=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const players = await response.json();
      console.log('searchPlayers local data:', players);
      
      // Transform the data to match the expected format
      const transformedPlayers = players.map(player => ({
        id: player.player_id,
        fullName: player.name, // changed from player.player_name
        firstName: player.name.split(', ')[1] || player.name,
        lastName: player.name.split(', ')[0] || player.name,
        active: true,
        isPlayer: true,
        // Add some basic stats for display
        stats: {
          ba: player.ba,
          obp: player.obp,
          slg: player.slg,
          woba: player.woba,
          pa: player.pa,
          hits: player.hits,
          hrs: player.hrs
        }
      }));
      
      this.setCachedData(cacheKey, transformedPlayers);
      return transformedPlayers;
    } catch (error) {
      console.error('searchPlayers error:', error);
      // Return empty array on error for UI robustness
      return [];
    }
  }

  // Get player stats from local database
  async getPlayerStats(playerId, season = new Date().getFullYear(), group = 'hitting') {
    const cacheKey = `stats_${playerId}_${season}_${group}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/players/${playerId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const player = await response.json();
      const statcast = player.statcast_history && player.statcast_history[0];
      const fangraphs = player.fangraphs_history && player.fangraphs_history[0];
      // Transform to match expected stats format
      const toNum = v => v === null || v === undefined ? 0 : Number(v);
      const stats = {
        stats: [{
          group: { displayName: 'Hitting' },
          stats: [
            { name: 'avg', value: toNum(statcast?.ba || fangraphs?.avg) },
            { name: 'obp', value: toNum(fangraphs?.obp) },
            { name: 'slg', value: toNum(statcast?.slg || fangraphs?.slg) },
            { name: 'woba', value: toNum(statcast?.woba || fangraphs?.woba) },
            { name: 'pa', value: toNum(statcast?.plate_appearances || fangraphs?.plate_appearances) },
            { name: 'hits', value: toNum(statcast?.hits) },
            { name: 'hrs', value: toNum(statcast?.home_runs || fangraphs?.home_runs) },
            { name: 'bb', value: toNum(fangraphs?.walks) },
            { name: 'so', value: toNum(statcast?.strikeouts || fangraphs?.strikeouts) },
            { name: 'iso', value: toNum(statcast?.iso || fangraphs?.iso) },
            { name: 'babip', value: toNum(statcast?.babip || fangraphs?.babip) },
            { name: 'xba', value: toNum(statcast?.xba) },
            { name: 'xwoba', value: toNum(statcast?.xwoba) }
          ]
        }]
      };
      
      this.setCachedData(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('getPlayerStats error:', error);
      // Return fallback empty stats for UI robustness
      return { stats: [{ group: { displayName: 'Hitting' }, stats: [] }] };
    }
  }

  // Get player info from local database
  async getPlayerInfo(playerId) {
    const cacheKey = `player_${playerId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/players/${playerId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const player = await response.json();
      const playerObj = player.player || player; // handle both {player: {...}} and {...}
      const name = playerObj.name || 'Unknown';
      // Transform to match expected player info format
      const playerInfo = {
        people: [{
          id: playerObj.player_id,
          fullName: name,
          firstName: name.split(', ')[1] || name,
          lastName: name.split(', ')[0] || name,
          active: true,
          isPlayer: true,
          primaryPosition: { abbreviation: 'B' }, // Batter
          currentTeam: { name: 'MLB' }
        }]
      };
      
      this.setCachedData(cacheKey, playerInfo);
      return playerInfo;
    } catch (error) {
      console.error('getPlayerInfo error:', error);
      // Return fallback player info for UI robustness
      return { people: [{ id: playerId, fullName: 'Unknown', firstName: 'Unknown', lastName: 'Unknown', active: false, isPlayer: false, primaryPosition: { abbreviation: 'B' }, currentTeam: { name: 'MLB' } }] };
    }
  }

  // Get all players (for dropdown/selection)
  async getAllPlayers(limit = 100) {
    const cacheKey = `all_players_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/players?limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const players = await response.json();
      
      // Transform the data to match the expected format
      const transformedPlayers = players.map(player => ({
        id: player.player_id,
        fullName: player.name, // changed from player.player_name
        firstName: player.name.split(', ')[1] || player.name,
        lastName: player.name.split(', ')[0] || player.name,
        active: true,
        isPlayer: true
      }));
      
      this.setCachedData(cacheKey, transformedPlayers);
      return transformedPlayers;
    } catch (error) {
      console.error('getAllPlayers error:', error);
      // Return empty array on error for UI robustness
      return [];
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

export default new PlayerDataService(); 