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

export const PRESET_PLAYERS = [
  { name: "Shohei Ohtani", salary: 70, war: 10.1 },
  { name: "Mike Trout", salary: 35.5, war: 2.3 },
  { name: "Mookie Betts", salary: 30, war: 6.8 },
  { name: "Yordan Alvarez", salary: 7.8, war: 5.5 },
  { name: "Ronald Acuña Jr.", salary: 17, war: 8.0 },
  { name: "Average Starter", salary: 4.5, war: 2.0 }
];

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
