// Team calculation functions
export const calculateTeamMetrics = (payrollInMillions, teamWAR, leagueData) => {
  const teamPayroll = payrollInMillions * 1000000;
  const marketRatePerWAR = 8000000; // $8M per WAR
  
  // Calculate cost per WAR
  const costPerWAR = parseFloat((payrollInMillions / teamWAR).toFixed(2));
  
  // Expected WAR based on payroll
  const expectedWAR = payrollInMillions / 8; // $8M per WAR
  
  // Market value of team's actual WAR
  const marketValue = (teamWAR * marketRatePerWAR) / 1000000;
  
  // Efficiency ratio
  const efficiency = parseFloat((teamWAR / expectedWAR).toFixed(2));
  
  // Surplus value
  const surplusValue = marketValue - payrollInMillions;
  
  // Win percentage estimate (43 WAR = .500 team)
  const winPercentage = ((teamWAR / 43) * 0.500).toFixed(3);
  const projectedWins = Math.round((teamWAR / 43) * 81);
  
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
    teamCategory
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
