import { WAR_VALUE_THRESHOLDS, EFFICIENCY_THRESHOLDS } from './constants';

// Core calculation functions
export const calculateContractMetrics = (salaryInMillions, war, leagueData) => {
  const playerSalary = salaryInMillions * 1000000;
  
  // Use the actual market rate for WAR (around $8M in 2024)
  const marketRatePerWAR = 8000000; // $8M per WAR
  
  // Calculate cost per WAR in millions
  const costPerWAR = parseFloat((salaryInMillions / war).toFixed(2));
  
  // Market value based on actual market rate
  const marketValue = (war * marketRatePerWAR) / 1000000;
  
  // Contract efficiency (ratio of market value to actual salary)
  const contractEfficiency = parseFloat((marketValue / salaryInMillions).toFixed(2));
  
  // Surplus value (positive = team saves money, negative = overpaid)
  const surplusValue = marketValue - salaryInMillions;
  
  // Calculate percentile rank
  const percentileRank = calculatePercentileRank(war, leagueData.topPercentiles);
  
  // Determine WAR value category based on $/WAR
  const warValueCategory = getWARValueCategory(costPerWAR);
  
  return {
    playerSalary,
    playerWAR: war,
    costPerWAR,
    leagueAvgPerWAR: (marketRatePerWAR / 1000000).toFixed(1), // Show $8.0M
    marketValue: parseFloat(marketValue.toFixed(1)),
    contractEfficiency,
    surplusValue: parseFloat(surplusValue.toFixed(1)),
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
