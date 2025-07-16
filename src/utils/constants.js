// © 2024–2025 Harnisch LLC. All rights reserved.
// Developed in partnership with BadderSports and SwingBadder.
// Unauthorized commercial use or branding is prohibited.

// Year-based league minimum salaries (source: baseball-almanac.com)
export const LEAGUE_MINIMUM_BY_YEAR = {
  1985: 60000,
  1986: 60000,
  1987: 62500,
  1988: 62500,
  1989: 68000,
  1990: 100000,
  1991: 100000,
  1992: 109000,
  1993: 109000,
  1994: 109000,
  1995: 109000,
  1996: 109000,
  1997: 150000,
  1998: 170000,
  1999: 200000,
  2000: 200000,
  2001: 200000,
  2002: 200000,
  2003: 300000,
  2004: 300000,
  2005: 316000,
  2006: 327000,
  2007: 380000,
  2008: 390000,
  2009: 400000,
  2010: 400000,
  2011: 414000,
  2012: 480000,
  2013: 490000,
  2014: 500000,
  2015: 507500,
  2016: 507500,
  2017: 535000,
  2018: 545000,
  2019: 555000,
  2020: 563500,
  2021: 570500,
  2022: 700000,
  2023: 720000,
  2024: 740000,
  2025: 780000
};

// Year-based market rates per WAR (estimated based on free agent spending)
export const MARKET_RATE_PER_WAR_BY_YEAR = {
  1985: 500000,   // ~$500K per WAR in 1985
  1986: 550000,
  1987: 600000,
  1988: 650000,
  1989: 700000,
  1990: 800000,
  1991: 900000,
  1992: 1000000,
  1993: 1100000,
  1994: 1200000,
  1995: 1300000,
  1996: 1500000,
  1997: 1700000,
  1998: 2000000,
  1999: 2300000,
  2000: 2600000,
  2001: 2900000,
  2002: 3200000,
  2003: 3500000,
  2004: 3800000,
  2005: 4100000,
  2006: 4400000,
  2007: 4700000,
  2008: 5000000,
  2009: 5300000,
  2010: 5600000,
  2011: 5900000,
  2012: 6200000,
  2013: 6500000,
  2014: 6800000,
  2015: 7100000,
  2016: 7400000,
  2017: 7700000,
  2018: 8000000,
  2019: 8300000,
  2020: 8600000,
  2021: 8900000,
  2022: 9200000,
  2023: 9500000,
  2024: 9800000,
  2025: 10100000
};

// Default MLB data - based on 2024 market rates
export const LEAGUE_DATA = {
  avgWAR: 2.0,
  avgSalary: 4500000,
  replacementSalary: 740000,
  marketRatePerWAR: 8000000,  // $8M per WAR (2024 baseline)
  avgTeamWAR: 43,             // baseline for .500 team
  topPercentiles: {
    90: 5.0,
    75: 3.5,
    50: 2.0,
    25: 1.0
  }
};

// Get league data for a specific year
export const getLeagueDataForYear = (year = 2024) => {
  const leagueMin = LEAGUE_MINIMUM_BY_YEAR[year] || LEAGUE_MINIMUM_BY_YEAR[2024];
  const marketRate = MARKET_RATE_PER_WAR_BY_YEAR[year] || MARKET_RATE_PER_WAR_BY_YEAR[2024];
  
  return {
    ...LEAGUE_DATA,
    replacementSalary: leagueMin,
    marketRatePerWAR: marketRate,
    year: year
  };
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
