// Default MLB data - will be overridden by GitHub data when available
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

// Remove PRESET_PLAYERS since we'll use real data
export const PRESET_PLAYERS = [];

// $/WAR thresholds for categorization
export const WAR_VALUE_THRESHOLDS = {
  historicBargain: 1.0,  // < $1M per WAR
  highValue: 4.0,        // < $4M per WAR
  average: 10.0,         // < $10M per WAR
  // >= $10M per WAR is Poor Value
};

export const EFFICIENCY_THRESHOLDS = {
  excellent: 2.0,
  good: 1.5,
  fair: 1.0,
  poor: 0.5
};

// Data source URLs
export const DATA_SOURCES = {
  WAR_DATA: 'https://raw.githubusercontent.com/NeilPaine/MLB-WAR-data-historical/master/war_daily_bat.txt',
  SALARY_DATA: 'https://raw.githubusercontent.com/ianwhitestone/mlb-salaries-eda/master/data/lahman/Salaries.csv',
  PLAYER_MAPPING: 'https://raw.githubusercontent.com/ianwhitestone/mlb-salaries-eda/master/data/lahman/People.csv'
};
