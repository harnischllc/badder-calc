// Default MLB data - based on 2024 market rates
export const LEAGUE_DATA = {
  avgWAR: 2.0,
  avgSalary: 4500000,
  replacementSalary: 740000,
  topPercentiles: {
    90: 5.0,
    75: 3.5,
    50: 2.0,
    25: 1.0
  }
};

// $/WAR thresholds for categorization (in millions)
export const WAR_VALUE_THRESHOLDS = {
  historicBargain: 1.0,   // < $1M per WAR
  highValue: 4.0,         // < $4M per WAR  
  average: 10.0,          // < $10M per WAR
  // >= $10M per WAR is Poor Value
};

// Contract efficiency thresholds
export const EFFICIENCY_THRESHOLDS = {
  excellent: 2.0,
  good: 1.5,
  fair: 1.0,
  poor: 0.5
};
