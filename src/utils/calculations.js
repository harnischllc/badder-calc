import { WAR_VALUE_THRESHOLDS, EFFICIENCY_THRESHOLDS } from './constants';

// Core calculation functions
export const calculateContractMetrics = (salaryInMillions, war, leagueData) => {
  const playerSalary = salaryInMillions * 1000000;
  const leagueAvgPerWAR = (leagueData.avgSalary - leagueData.replacementSalary) / leagueData.avgWAR;
  
  // Calculate cost per WAR in millions
  const costPerWAR = parseFloat((salaryInMillions / war).toFixed(2));
  
  // Market value based on league average
  const marketValue = (war * leagueAvgPerWAR + leagueData.replacementSalary) / 1000000;
  
  // Contract efficiency
  const contractEfficiency = parseFloat(((marketValue * 1000000) / playerSalary).toFixed(2));
  
  // Surplus value
  const surplusValue = marketValue - salaryInMillions;
  
  // Calculate percentile rank
  const percentileRank = calculatePercentileRank(war, leagueData.topPercentiles);
  
  // Determine WAR value category based on $/WAR
  const warValueCategory = getWARValueCategory(costPerWAR);
  
  return {
    playerSalary,
    playerWAR: war,
    costPerWAR,
    leagueAvgPerWAR: (leagueAvgPerWAR / 1000000).toFixed(2),
    marketValue,
    contractEfficiency,
    surplusValue,
    percentileRank,
    warValueCategory,
    category: warValueCategory // for backwards compatibility
  };
};

// Determine WAR value category based on cost per WAR
export const getWARValueCategory = (costPerWAR) => {
  if (costPerWAR < WAR_VALUE_THRESHOLDS.historicBargain) {
    return 'Historic Bargain';
  } else if (costPerWAR < WAR_VALUE_THRESHOLDS.highValue) {
    return 'High Value';
  } else if (costPerWAR < WAR_VALUE_THRESHOLDS.average) {
    return 'Average';
  } else {
    return 'Poor Value';
  }
};

// Calculate percentile rank
export const calculatePercentileRank = (war, percentiles) => {
  if (war >= percentiles[90]) return 90;
  if (war >= percentiles[75]) return 75;
  if (war >= percentiles[50]) return 50;
  if (war >= percentiles[25]) return 25;
  return 10;
};

// Validation functions
export const validateInputs = (salary, war) => {
  const errors = { salary: '', war: '' };
  let isValid = true;
  
  if (!salary || parseFloat(salary) <= 0) {
    errors.salary = 'Please enter a valid salary greater than 0';
    isValid = false;
  }
  
  if (!war || parseFloat(war) < -2) {
    errors.war = 'Please enter a valid WAR (minimum -2.0)';
    isValid = false;
  }
  
  if (parseFloat(war) > 15) {
    errors.war = 'WAR seems unusually high. Please verify.';
    isValid = false;
  }
  
  return { errors, isValid };
};

// URL parameter functions
export const updateURLParams = (salary, war) => {
  const params = new URLSearchParams();
  if (salary) params.set('salary', salary);
  if (war) params.set('war', war);
  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.replaceState({}, '', newURL);
};

export const loadFromURLParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    salary: params.get('salary') || '',
    war: params.get('war') || ''
  };
};

// Local storage functions for history
const HISTORY_KEY = 'contract_war_history';

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

// UI helper functions
export const getValueColor = (efficiency) => {
  if (efficiency >= EFFICIENCY_THRESHOLDS.excellent) return 'text-purple-500';
  if (efficiency >= EFFICIENCY_THRESHOLDS.good) return 'text-green-500';
  if (efficiency >= EFFICIENCY_THRESHOLDS.fair) return 'text-yellow-500';
  return 'text-red-500';
};

export const getValueLabel = (efficiency) => {
  if (efficiency >= EFFICIENCY_THRESHOLDS.excellent) return 'Excellent';
  if (efficiency >= EFFICIENCY_THRESHOLDS.good) return 'Good';
  if (efficiency >= EFFICIENCY_THRESHOLDS.fair) return 'Fair';
  return 'Poor';
};
