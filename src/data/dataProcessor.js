// Data processor for merging WAR and salary data
export async function loadHistoricalData() {
  try {
    // Check cache first
    const cached = localStorage.getItem('mlb_historical_data');
    const cacheTimestamp = localStorage.getItem('mlb_data_timestamp');
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    if (cached && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < oneWeek) {
      return JSON.parse(cached);
    }

    // For now, use static historical data
    // The GitHub data sources require complex parsing that needs proper implementation
    const historicalData = getStaticHistoricalData();

    // Cache the processed data
    localStorage.setItem('mlb_historical_data', JSON.stringify(historicalData));
    localStorage.setItem('mlb_data_timestamp', Date.now().toString());

    return historicalData;
  } catch (error) {
    console.error('Error loading historical data:', error);
    return getStaticHistoricalData();
  }
}

// Static historical data for key players
function getStaticHistoricalData() {
  return {
    'Mike Trout': {
      name: 'Mike Trout',
      seasons: {
        '2024': { fWAR: 5.2, bWAR: 5.4, avgWAR: 5.3, salary: 35541666 },
        '2023': { fWAR: 10.3, bWAR: 10.2, avgWAR: 10.25, salary: 35541666 },
        '2022': { fWAR: 3.2, bWAR: 3.4, avgWAR: 3.3, salary: 35541666 },
        '2021': { fWAR: 9.1, bWAR: 8.3, avgWAR: 8.7, salary: 35541666 },
        '2020': { fWAR: 3.5, bWAR: 2.5, avgWAR: 3.0, salary: 36000000 }
      },
      career: { totalWAR: 86.2, totalEarnings: 426000000, seasonsPlayed: 14 }
    },
    'Mookie Betts': {
      name: 'Mookie Betts',
      seasons: {
        '2024': { fWAR: 6.8, bWAR: 7.0, avgWAR: 6.9, salary: 30000000 },
        '2023': { fWAR: 8.3, bWAR: 8.3, avgWAR: 8.3, salary: 30000000 },
        '2022': { fWAR: 6.4, bWAR: 6.6, avgWAR: 6.5, salary: 27000000 },
        '2021': { fWAR: 5.3, bWAR: 4.8, avgWAR: 5.05, salary: 22500000 },
        '2020': { fWAR: 3.4, bWAR: 2.7, avgWAR: 3.05, salary: 27000000 }
      },
      career: { totalWAR: 66.8, totalEarnings: 245000000, seasonsPlayed: 11 }
    },
    'Shohei Ohtani': {
      name: 'Shohei Ohtani',
      seasons: {
        '2024': { fWAR: 10.1, bWAR: 9.8, avgWAR: 9.95, salary: 70000000 },
        '2023': { fWAR: 10.0, bWAR: 10.1, avgWAR: 10.05, salary: 30000000 },
        '2022': { fWAR: 9.6, bWAR: 8.9, avgWAR: 9.25, salary: 5500000 },
        '2021': { fWAR: 9.0, bWAR: 8.1, avgWAR: 8.55, salary: 3000000 },
        '2020': { fWAR: 1.4, bWAR: 1.4, avgWAR: 1.4, salary: 700000 }
      },
      career: { totalWAR: 44.1, totalEarnings: 112500000, seasonsPlayed: 7 }
    },
    'Aaron Judge': {
      name: 'Aaron Judge',
      seasons: {
        '2024': { fWAR: 8.5, bWAR: 8.2, avgWAR: 8.35, salary: 40000000 },
        '2023': { fWAR: 2.8, bWAR: 3.0, avgWAR: 2.9, salary: 40000000 },
        '2022': { fWAR: 11.5, bWAR: 10.6, avgWAR: 11.05, salary: 19000000 },
        '2021': { fWAR: 5.5, bWAR: 6.0, avgWAR: 5.75, salary: 10175000 },
        '2020': { fWAR: 2.7, bWAR: 2.8, avgWAR: 2.75, salary: 8500000 }
      },
      career: { totalWAR: 50.8, totalEarnings: 146000000, seasonsPlayed: 9 }
    },
    'Ronald Acuña Jr.': {
      name: 'Ronald Acuña Jr.',
      seasons: {
        '2024': { fWAR: 1.5, bWAR: 1.7, avgWAR: 1.6, salary: 17000000 },
        '2023': { fWAR: 8.0, bWAR: 8.2, avgWAR: 8.1, salary: 12500000 },
        '2022': { fWAR: 4.4, bWAR: 4.9, avgWAR: 4.65, salary: 5000000 },
        '2021': { fWAR: 1.9, bWAR: 2.1, avgWAR: 2.0, salary: 1000000 },
        '2020': { fWAR: 1.3, bWAR: 1.4, avgWAR: 1.35, salary: 1000000 }
      },
      career: { totalWAR: 29.5, totalEarnings: 40000000, seasonsPlayed: 7 }
    },
    'Juan Soto': {
      name: 'Juan Soto',
      seasons: {
        '2024': { fWAR: 7.5, bWAR: 7.8, avgWAR: 7.65, salary: 31000000 },
        '2023': { fWAR: 5.0, bWAR: 5.2, avgWAR: 5.1, salary: 23000000 },
        '2022': { fWAR: 6.1, bWAR: 5.6, avgWAR: 5.85, salary: 17100000 },
        '2021': { fWAR: 4.9, bWAR: 5.1, avgWAR: 5.0, salary: 8500000 },
        '2020': { fWAR: 2.5, bWAR: 2.2, avgWAR: 2.35, salary: 8500000 }
      },
      career: { totalWAR: 36.5, totalEarnings: 95000000, seasonsPlayed: 7 }
    },
    'Jose Altuve': {
      name: 'Jose Altuve',
      seasons: {
        '2024': { fWAR: 5.3, bWAR: 5.0, avgWAR: 5.15, salary: 29000000 },
        '2023': { fWAR: 3.5, bWAR: 3.8, avgWAR: 3.65, salary: 29000000 },
        '2022': { fWAR: 5.3, bWAR: 4.6, avgWAR: 4.95, salary: 29000000 },
        '2021': { fWAR: 5.2, bWAR: 5.3, avgWAR: 5.25, salary: 29000000 },
        '2020': { fWAR: 2.1, bWAR: 2.2, avgWAR: 2.15, salary: 29000000 }
      },
      career: { totalWAR: 56.2, totalEarnings: 268000000, seasonsPlayed: 14 }
    },
    'Freddie Freeman': {
      name: 'Freddie Freeman',
      seasons: {
        '2024': { fWAR: 4.5, bWAR: 4.7, avgWAR: 4.6, salary: 27000000 },
        '2023': { fWAR: 5.5, bWAR: 6.1, avgWAR: 5.8, salary: 27000000 },
        '2022': { fWAR: 5.9, bWAR: 5.5, avgWAR: 5.7, salary: 27000000 },
        '2021': { fWAR: 4.5, bWAR: 4.7, avgWAR: 4.6, salary: 22000000 },
        '2020': { fWAR: 3.0, bWAR: 3.2, avgWAR: 3.1, salary: 22000000 }
      },
      career: { totalWAR: 62.8, totalEarnings: 235000000, seasonsPlayed: 15 }
    }
  };
}

// Search function for player autocomplete
export function searchPlayers(query, data) {
  if (!data || !query) return [];
  
  const results = [];
  const lowerQuery = query.toLowerCase();

  for (const playerName of Object.keys(data)) {
    if (playerName.toLowerCase().includes(lowerQuery)) {
      const player = data[playerName];
      const years = Object.keys(player.seasons).sort((a, b) => b - a);
      const latestYear = years[0];
      const latestSeason = player.seasons[latestYear];
      
      results.push({
        name: playerName,
        latestYear,
        latestWAR: latestSeason?.avgWAR || 0,
        careerWAR: player.career.totalWAR
      });
    }
  }

  return results.sort((a, b) => b.careerWAR - a.careerWAR).slice(0, 10);
}

// Get current season data from Google Sheets
export async function getCurrentSeasonData() {
  try {
    // You'll need to set up your Google Sheets API endpoint
    // For now, return mock data
    return {
      lastUpdated: new Date().toISOString(),
      players: {}
    };
  } catch (error) {
    console.error('Error fetching current season data:', error);
    return null;
  }
}
