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

    // Fetch WAR data from Neil Paine's repo
    const warResponse = await fetch(
      'https://raw.githubusercontent.com/NeilPaine/MLB-WAR-data-historical/master/war_daily_bat.txt'
    );
    const warText = await warResponse.text();
    
    // Fetch salary data from Ian Whitestone's repo (Lahman dataset)
    const salaryResponse = await fetch(
      'https://raw.githubusercontent.com/ianwhitestone/mlb-salaries-eda/master/data/lahman/Salaries.csv'
    );
    const salaryText = await salaryResponse.text();

    // Process and merge the data
    const warData = parseWARData(warText);
    const salaryData = parseSalaryData(salaryText);
    const mergedData = mergePlayerData(warData, salaryData);

    // Cache the processed data
    localStorage.setItem('mlb_historical_data', JSON.stringify(mergedData));
    localStorage.setItem('mlb_data_timestamp', Date.now().toString());

    return mergedData;
  } catch (error) {
    console.error('Error loading historical data:', error);
    return null;
  }
}

function parseWARData(text) {
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const playerData = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < headers.length) continue;

    const name = values[0];
    const year = parseInt(values[3]);
    const fWAR = parseFloat(values[headers.indexOf('WAR')]) || 0;
    const bWAR = parseFloat(values[headers.indexOf('WAA')]) || 0; // Adjust index as needed

    if (!playerData[name]) {
      playerData[name] = { seasons: {} };
    }

    if (!playerData[name].seasons[year]) {
      playerData[name].seasons[year] = {};
    }

    playerData[name].seasons[year].fWAR = fWAR;
    playerData[name].seasons[year].bWAR = bWAR;
  }

  return playerData;
}

function parseSalaryData(text) {
  const lines = text.split('\n');
  const salaryData = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < 5) continue;

    const year = parseInt(values[0]);
    const playerID = values[2];
    const salary = parseInt(values[4]);

    // We'll need to map playerIDs to names
    // For now, store by ID
    if (!salaryData[playerID]) {
      salaryData[playerID] = {};
    }

    salaryData[playerID][year] = salary;
  }

  return salaryData;
}

function mergePlayerData(warData, salaryData) {
  const merged = {};

  // Process each player
  for (const [playerName, data] of Object.entries(warData)) {
    merged[playerName] = {
      name: playerName,
      seasons: {},
      career: { totalWAR: 0, totalEarnings: 0, seasonsPlayed: 0 }
    };

    // Calculate career totals
    for (const [year, seasonData] of Object.entries(data.seasons)) {
      const avgWAR = (seasonData.fWAR + seasonData.bWAR) / 2;
      merged[playerName].seasons[year] = {
        fWAR: seasonData.fWAR,
        bWAR: seasonData.bWAR,
        avgWAR: avgWAR,
        salary: null // Will be populated from salary data
      };

      merged[playerName].career.totalWAR += avgWAR;
      merged[playerName].career.seasonsPlayed++;
    }
  }

  return merged;
}

// Search function for player autocomplete
export function searchPlayers(query, data) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  for (const playerName of Object.keys(data)) {
    if (playerName.toLowerCase().includes(lowerQuery)) {
      const player = data[playerName];
      const latestYear = Math.max(...Object.keys(player.seasons).map(Number));
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
