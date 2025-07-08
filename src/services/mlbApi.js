// MLB Stats API Service
const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';

// Player IDs for our preset players
const PLAYER_IDS = {
  'Shohei Ohtani': 660271,
  'Mike Trout': 545361,
  'Mookie Betts': 605141,
  'Yordan Alvarez': 670541,
  'Ronald Acuña Jr.': 660670
};

export async function fetchPlayerStats(playerName, season = 2024) {
  try {
    const playerId = PLAYER_IDS[playerName];
    if (!playerId) return null;

    const response = await fetch(
      `${MLB_API_BASE}/people/${playerId}/stats?stats=season&season=${season}&gameType=R`
    );
    
    if (!response.ok) throw new Error('Failed to fetch player stats');
    
    const data = await response.json();
    
    // Extract WAR from stats (Note: MLB API doesn't provide WAR directly)
    // We'll need to calculate it or get from another source
    const stats = data.stats?.[0]?.splits?.[0]?.stat || {};
    
    return {
      name: playerName,
      stats: stats,
      // MLB API doesn't provide salary or WAR
      // We'll keep these from our static data for now
    };
  } catch (error) {
    console.error(`Error fetching stats for ${playerName}:`, error);
    return null;
  }
}

// Fetch current league averages
export async function fetchLeagueAverages(season = 2024) {
  try {
    const response = await fetch(
      `${MLB_API_BASE}/stats?stats=season&season=${season}&gameType=R&group=hitting`
    );
    
    if (!response.ok) throw new Error('Failed to fetch league averages');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching league averages:', error);
    return null;
  }
}

// Since MLB API doesn't provide WAR or salaries, let's use a fallback approach
// that combines multiple sources
export async function fetchEnhancedPlayerData() {
  // For now, return null - we'll enhance this with additional sources
  return null;
}
