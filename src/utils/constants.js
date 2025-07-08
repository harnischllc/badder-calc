// Default MLB data - based on 2024 market rates
export const LEAGUE_DATA = {
  avgWAR: 2.0,
  avgSalary: 4500000,
  replacementSalary: 740000,
  marketRatePerWAR: 8000000,  // Add this - $8M per WAR
  avgTeamWAR: 43,             // Add this - baseline for .500 team
  topPercentiles: {
    90: 5.0,
    75: 3.5,
    50: 2.0,
    25: 1.0
  }
};

// $/WAR thresholds for categorization (in millions)
export const WAR_VALUE_THRESHOLDS = {
  historicBargain: 2.0,   // < $2M per WAR (75% off market)
  highValue: 6.0,         // < $6M per WAR (25% off market)  
  average: 10.0,          // < $10M per WAR (up to 25% over market)
  // >= $10M per WAR is Poor Value (25%+ overpay)
};

// Contract efficiency thresholds
export const EFFICIENCY_THRESHOLDS = {
  excellent: 2.0,
  good: 1.5,
  fair: 1.0,
  poor: 0.5
};
