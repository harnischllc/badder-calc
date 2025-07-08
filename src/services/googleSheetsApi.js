// Google Sheets integration for current season data
// You'll need to create a Google Sheets with columns: Player, Salary, fWAR, bWAR

const SHEET_ID = '1Fdk51E1KpaZkoEldx-jnZqdZjwNmYt5qwJuSIsVOTC4'; // Replace with your sheet ID
const API_KEY = 'AIzaSyCDC8IUHDfbH8xvR48-I-dCzfSqJM8NGdc'; // Replace with your API key (can be public for read-only)
const RANGE = 'Sheet1!A:D'; // Adjust based on your sheet structure

export async function fetchCurrentSeasonFromSheets() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google Sheets data');
    }

    const data = await response.json();
    return processSheetData(data.values);
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    // Fallback to static data for current season
    return getStaticCurrentSeason();
  }
}

function processSheetData(rows) {
  if (!rows || rows.length < 2) return {};
  
  const headers = rows[0];
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

  return {
    lastUpdated: new Date().toISOString(),
    season: 2025,
    players: playerData
  };
}

// Static fallback data for 2025 season
function getStaticCurrentSeason() {
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

// Instructions for setting up Google Sheets:
/*
1. Create a new Google Sheet
2. Add headers: Player | Salary (M) | fWAR | bWAR
3. Share the sheet publicly (view only)
4. Get the Sheet ID from the URL
5. Enable Google Sheets API in Google Cloud Console
6. Create an API key (restricted to Sheets API)
7. Replace SHEET_ID and API_KEY above
*/

export function getGoogleSheetsSetupInstructions() {
  return `
    Google Sheets Setup Instructions:
    
    1. Create a Google Sheet with these columns:
       - Column A: Player Name
       - Column B: Salary (in millions)
       - Column C: fWAR
       - Column D: bWAR
    
    2. Make the sheet publicly viewable:
       - Click Share button
       - Change to "Anyone with the link can view"
    
    3. Get your Sheet ID:
       - Look at the URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
       - Copy the SHEET_ID part
    
    4. Get an API Key:
       - Go to https://console.cloud.google.com/
       - Create a new project or select existing
       - Enable Google Sheets API
       - Create credentials > API Key
       - Restrict key to Google Sheets API
    
    5. Update the constants in this file with your values
    
    6. Use Zapier to auto-update the sheet:
       - Trigger: New data from MLB stats source
       - Action: Update Google Sheet row
  `;
}
