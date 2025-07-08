// Google Sheets integration for current season and historical data
const CURRENT_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || '1Fdk51E1KpaZkoEldx-jnZqdZjwNmYt5qwJuSIsVOTC4';
const HISTORICAL_SHEET_ID = import.meta.env.VITE_HISTORICAL_SHEET_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

export async function fetchCurrentSeasonFromSheets() {
  try {
    console.log('Fetching from Google Sheets...');
    console.log('API Key present:', !!API_KEY);
    console.log('Sheet ID:', SHEET_ID);
    
    if (!API_KEY) {
      console.warn('Google API key not found. Using static data.');
      return getStaticCurrentSeason();
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CURRENT_SHEET_ID}/values/Sheet1!A:D?key=${API_KEY}`;
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://contract-war-calculator.onrender.com'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', response.status, errorText);
      throw new Error(`Failed to fetch Google Sheets data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched sheet data');
    return processSheetData(data.values);
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return getStaticCurrentSeason();
  }
}

export async function fetchHistoricalDataFromSheets() {
  try {
    if (!API_KEY || !HISTORICAL_SHEET_ID) {
      console.warn('Historical sheet not configured');
      return null;
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${HISTORICAL_SHEET_ID}/values/Sheet1!A:E?key=${API_KEY}`;
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://contract-war-calculator.onrender.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.status}`);
    }

    const data = await response.json();
    return processHistoricalSheetData(data.values);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return null;
  }
}

function processSheetData(rows) {
  if (!rows || rows.length < 2) {
    console.warn('Insufficient data in sheet');
    return getStaticCurrentSeason();
  }
  
  const headers = rows[0];
  console.log('Sheet headers:', headers);
  const playerData = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4) continue;

    const name = row[0];
    const salary = parseFloat(row[1]) || 0;
    const fWAR = parseFloat(row[2]) || 0;
    const bWAR = parseFloat(row[3]) || 0;

    playerData[name] = {
      salary: salary,
      fWAR: fWAR,
      bWAR: bWAR,
      avgWAR: (fWAR + bWAR) / 2
    };
  }

  console.log(`Processed ${Object.keys(playerData).length} players from sheet`);
  
  return {
    lastUpdated: new Date().toISOString(),
    season: 2025,
    players: playerData
  };
}

function processHistoricalSheetData(rows) {
  if (!rows || rows.length < 2) return null;
  
  const playerData = {};

  for (let i = 1; i < rows.length; i++) {
    const [name, year, salary, fWAR, bWAR] = rows[i];
    if (!name || !year) continue;

    if (!playerData[name]) {
      playerData[name] = {
        name,
        seasons: {},
        career: { totalWAR: 0, totalEarnings: 0, seasonsPlayed: 0 }
      };
    }

    const yearNum = parseInt(year);
    const salaryNum = parseFloat(salary) || 0;
    const fWARNum = parseFloat(fWAR) || 0;
    const bWARNum = parseFloat(bWAR) || 0;
    const avgWAR = (fWARNum + bWARNum) / 2;

    playerData[name].seasons[yearNum] = {
      salary: salaryNum * 1000000, // Convert millions to dollars
      fWAR: fWARNum,
      bWAR: bWARNum,
      avgWAR
    };

    playerData[name].career.totalWAR += avgWAR;
    playerData[name].career.totalEarnings += salaryNum * 1000000;
    playerData[name].career.seasonsPlayed++;
  }

  return playerData;
}

// Static fallback data for 2025 season
function getStaticCurrentSeason() {
  console.log('Using static fallback data');
  return {
    lastUpdated: '2025-01-01',
    season: 2025,
    players: {
      'Shohei Ohtani': { salary: 70, fWAR: 10.1, bWAR: 9.8, avgWAR: 9.95 },
      'Mike Trout': { salary: 35.5, fWAR: 2.3, bWAR: 2.5, avgWAR: 2.4 },
      'Mookie Betts': { salary: 30, fWAR: 6.8, bWAR: 7.0, avgWAR: 6.9 },
      'Juan Soto': { salary: 65, fWAR: 7.5, bWAR: 7.8, avgWAR: 7.65 },
      'Aaron Judge': { salary: 40, fWAR: 8.5, bWAR: 8.2, avgWAR: 8.35 }
    }
  };
}
