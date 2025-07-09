import { LEAGUE_DATA } from './constants';

// Position data for calculations
const POSITION_DATA = {
  'C': { avgSalary: 3.2, avgWAR: 1.8, avgWRCplus: 95 },
  '1B': { avgSalary: 8.5, avgWAR: 2.1, avgWRCplus: 110 },
  '2B': { avgSalary: 5.8, avgWAR: 2.3, avgWRCplus: 98 },
  '3B': { avgSalary: 7.2, avgWAR: 2.4, avgWRCplus: 105 },
  'SS': { avgSalary: 7.8, avgWAR: 2.5, avgWRCplus: 100 },
  'LF': { avgSalary: 6.5, avgWAR: 1.9, avgWRCplus: 106 },
  'CF': { avgSalary: 7.1, avgWAR: 2.2, avgWRCplus: 102 },
  'RF': { avgSalary: 6.8, avgWAR: 2.0, avgWRCplus: 108 },
  'DH': { avgSalary: 9.2, avgWAR: 1.5, avgWRCplus: 115 },
  'SP': { avgSalary: 8.9, avgWAR: 2.8, avgWRCplus: null },
  'RP': { avgSalary: 3.1, avgWAR: 0.9, avgWRCplus: null }
};

// Team calculation functions
export const calculateTeamMetrics = (payrollInMillions, teamWAR, leagueData, gamesPlayed = 162) => {
  const teamPayroll = payrollInMillions * 1000000;
  const marketRatePerWAR = LEAGUE_DATA.marketRatePerWAR;
  
  // Calculate cost per WAR
  const costPerWAR = parseFloat((payrollInMillions / teamWAR).toFixed(2));
  
  // Expected WAR based on payroll
  const expectedWAR = payrollInMillions / (marketRatePerWAR / 1000000);
  
  // Market value of team's actual WAR
  const marketValue = (teamWAR * marketRatePerWAR) / 1000000;
  
  // Efficiency ratio
  const efficiency = parseFloat((teamWAR / expectedWAR).toFixed(2));
  
  // Surplus value
  const surplusValue = marketValue - payrollInMillions;
  
  // FIXED: Win projection based on current pace
  // If games played is less than 162, project full season WAR
  const projectedFullSeasonWAR = gamesPlayed < 162 
    ? (teamWAR / gamesPlayed) * 162 
    : teamWAR;
  
  // Win percentage and projected wins for full season
  const winPercentage = ((projectedFullSeasonWAR / LEAGUE_DATA.avgTeamWAR) * 0.500).toFixed(3);
  const projectedWins = Math.round((projectedFullSeasonWAR / LEAGUE_DATA.avgTeamWAR) * 81);
  
  // Current win pace (if games played is provided)
  const currentWinPace = gamesPlayed < 162 
    ? Math.round((teamWAR / LEAGUE_DATA.avgTeamWAR) * 81 * (162 / gamesPlayed))
    : projectedWins;
  
  // Determine team category
  const teamCategory = getTeamCategory(costPerWAR);
  
  return {
    teamPayroll: payrollInMillions,
    teamWAR,
    costPerWAR,
    expectedWAR: parseFloat(expectedWAR.toFixed(1)),
    marketValue: parseFloat(marketValue.toFixed(1)),
    efficiency,
    surplusValue: parseFloat(surplusValue.toFixed(1)),
    winPercentage,
    projectedWins,
    currentWinPace,
    projectedFullSeasonWAR: parseFloat(projectedFullSeasonWAR.toFixed(1)),
    teamCategory,
    gamesPlayed
  };
};

// Determine team efficiency category
export const getTeamCategory = (costPerWAR) => {
  if (costPerWAR < 3.0) {
    return 'Elite Efficiency';
  } else if (costPerWAR < 6.0) {
    return 'Above Average';
  } else if (costPerWAR < 10.0) {
    return 'Average';
  } else if (costPerWAR < 15.0) {
    return 'Below Average';
  } else {
    return 'Inefficient';
  }
};

// Validate team inputs
export const validateTeamInputs = (payroll, war) => {
  const errors = { teamPayroll: '', teamWAR: '' };
  let isValid = true;
  
  if (!payroll || parseFloat(payroll) <= 0) {
    errors.teamPayroll = 'Please enter a valid payroll greater than 0';
    isValid = false;
  }
  
  if (!war || parseFloat(war) < 0) {
    errors.teamWAR = 'Please enter a valid team WAR (minimum 0)';
    isValid = false;
  }
  
  if (parseFloat(war) > 70) {
    errors.teamWAR = 'Team WAR seems unusually high. Please verify.';
    isValid = false;
  }
  
  return { errors, isValid };
};

// Individual player calculations
export const calculateContractMetrics = (salaryInMillions, playerWAR, leagueData, position = null) => {
  const playerSalary = salaryInMillions * 1000000;
  const marketRatePerWAR = LEAGUE_DATA.marketRatePerWAR;
  
  // Cost per WAR
  const costPerWAR = playerWAR > 0 ? parseFloat((salaryInMillions / playerWAR).toFixed(2)) : Infinity;
  
  // Contract efficiency (player production value / actual salary)
  const playerValue = playerWAR * leagueData.replacementSalary;
  const contractEfficiency = parseFloat((playerValue / playerSalary).toFixed(2));
  
  // Surplus value (in millions)
  const marketValue = (playerWAR * marketRatePerWAR) / 1000000;
  const surplusValue = marketValue - salaryInMillions;
  
  // Determine value category based on $/WAR
  let warValueCategory;
  if (playerWAR < 0) {
    warValueCategory = 'Poor Value';
  } else if (costPerWAR < 2.0) {
    warValueCategory = 'Historic Bargain';
  } else if (costPerWAR < 6.0) {
    warValueCategory = 'High Value';
  } else if (costPerWAR < 10.0) {
    warValueCategory = 'Average';
  } else {
    warValueCategory = 'Poor Value';
  }
  
  // Percentile rank (simplified)
  let percentileRank;
  if (contractEfficiency >= 2.0) percentileRank = 95;
  else if (contractEfficiency >= 1.5) percentileRank = 80;
  else if (contractEfficiency >= 1.0) percentileRank = 60;
  else if (contractEfficiency >= 0.5) percentileRank = 30;
  else percentileRank = 10;
  
  // Calculate positional value if position is provided
  let positionalData = null;
  if (position && POSITION_DATA[position]) {
    positionalData = calculatePositionalValue(salaryInMillions, playerWAR, position, 'WAR');
  }
  
  return {
    playerSalary,
    playerWAR,
    costPerWAR: isFinite(costPerWAR) ? costPerWAR : 'N/A',
    contractEfficiency,
    surplusValue,
    marketValue,
    warValueCategory,
    percentileRank,
    leagueAvgPerWAR: marketRatePerWAR / 1000000,
    positionalData
  };
};

// Calculate positional value
export const calculatePositionalValue = (salary, performance, position, metric = 'WAR') => {
  const posData = POSITION_DATA[position];
  if (!posData) return null;

  const salaryRatio = salary / posData.avgSalary;
  const performanceRatio = metric === 'WAR' 
    ? performance / posData.avgWAR
    : performance / posData.avgWRCplus;

  // Positional Value Score: Performance relative to position avg vs Salary relative to position avg
  const positionalValueScore = (performanceRatio / salaryRatio) * 100;

  return {
    position,
    positionalValueScore: parseFloat(positionalValueScore.toFixed(1)),
    salaryVsPositionAvg: ((salary / posData.avgSalary - 1) * 100).toFixed(1),
    performanceVsPositionAvg: ((performanceRatio - 1) * 100).toFixed(1),
    positionAvgSalary: posData.avgSalary,
    positionAvgPerformance: metric === 'WAR' ? posData.avgWAR : posData.avgWRCplus
  };
};

// For wRC+ specific calculations
export const calculateWRCPlusValue = (salaryInMillions, wrcPlus, position = null) => {
  // wRC+ where 100 = average
  // Each point above 100 is 1% better than average
  const performanceAboveAverage = (wrcPlus - 100) / 100;
  
  // Rough estimate: 1 WAR ≈ 10 wRC+ points above average for full-time player
  const estimatedWAR = performanceAboveAverage * 10;
  
  // Value calculations
  const marketValue = estimatedWAR * 8; // $8M per WAR
  const surplusValue = marketValue - salaryInMillions;
  const efficiencyRating = wrcPlus / 100; // Simple efficiency vs average
  
  // Calculate positional value if position is provided
  let positionalData = null;
  if (position && POSITION_DATA[position] && POSITION_DATA[position].avgWRCplus) {
    positionalData = calculatePositionalValue(salaryInMillions, wrcPlus, position, 'wRC+');
  }
  
  return {
    wrcPlus,
    playerSalary: salaryInMillions * 1000000,
    salaryInMillions,
    performanceAboveAverage: (performanceAboveAverage * 100).toFixed(1),
    estimatedWAR: estimatedWAR.toFixed(1),
    marketValue: marketValue.toFixed(1),
    surplusValue: surplusValue.toFixed(1),
    efficiencyRating: efficiencyRating.toFixed(2),
    category: getWRCPlusCategory(wrcPlus, salaryInMillions),
    positionalData
  };
};

const getWRCPlusCategory = (wrcPlus, salary) => {
  const valueRatio = wrcPlus / salary; // Simple ratio for categorization
  
  if (wrcPlus >= 140 && salary < 10) return 'Elite Bargain';
  if (wrcPlus >= 120 && valueRatio > 10) return 'High Value';
  if (wrcPlus >= 100 && valueRatio > 5) return 'Good Value';
  if (wrcPlus >= 90) return 'Average Value';
  return 'Poor Value';
};

// Validate individual player inputs
export const validateInputs = (salary, war) => {
  const errors = { salary: '', war: '' };
  let isValid = true;
  
  if (!salary || parseFloat(salary) <= 0) {
    errors.salary = 'Please enter a valid salary greater than 0';
    isValid = false;
  }
  
  if (war === '' || war === null || war === undefined) {
    errors.war = 'Please enter a WAR value';
    isValid = false;
  }
  
  if (parseFloat(war) < -5) {
    errors.war = 'WAR seems unusually low. Please verify.';
    isValid = false;
  }
  
  if (parseFloat(war) > 15) {
    errors.war = 'WAR seems unusually high. Please verify.';
    isValid = false;
  }
  
  return { errors, isValid };
};

// Validate wRC+ inputs
export const validateWRCPlusInputs = (salary, wrcPlus) => {
  const errors = { salary: '', wrcPlus: '' };
  let isValid = true;
  
  if (!salary || parseFloat(salary) <= 0) {
    errors.salary = 'Please enter a valid salary greater than 0';
    isValid = false;
  }
  
  if (!wrcPlus || parseFloat(wrcPlus) < 0) {
    errors.wrcPlus = 'Please enter a valid wRC+ value';
    isValid = false;
  }
  
  if (parseFloat(wrcPlus) > 250) {
    errors.wrcPlus = 'wRC+ seems unusually high. Please verify.';
    isValid = false;
  }
  
  return { errors, isValid };
};

// URL parameter functions
export const updateURLParams = (salary, war) => {
  const params = new URLSearchParams();
  if (salary) params.set('salary', salary);
  if (war) params.set('war', war);
  
  const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
  window.history.replaceState({}, '', newURL);
};

export const loadFromURLParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    salary: params.get('salary') || '',
    war: params.get('war') || ''
  };
};

// History functions
const HISTORY_KEY = 'contractWARHistory';

export const saveHistory = (history) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
};

export const loadHistory = () => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load history:', e);
    return [];
  }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
};
