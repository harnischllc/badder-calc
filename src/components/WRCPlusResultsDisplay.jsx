import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Award, Target } from 'lucide-react';

const WRCPlusResultsDisplay = ({ results }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Elite Bargain':
        return 'text-purple-500';
      case 'High Value':
        return 'text-green-500';
      case 'Good Value':
        return 'text-blue-500';
      case 'Average Value':
        return 'text-yellow-500';
      case 'Poor Value':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Elite Bargain':
        return <Award className="w-5 h-5" />;
      case 'High Value':
        return <TrendingUp className="w-5 h-5" />;
      case 'Good Value':
        return <Activity className="w-5 h-5" />;
      case 'Average Value':
        return <Target className="w-5 h-5" />;
      case 'Poor Value':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 1.4) return 'text-purple-500';
    if (efficiency >= 1.2) return 'text-green-500';
    if (efficiency >= 1.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Primary Result */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white uppercase tracking-wider">
            wRC+ Analysis
          </h3>
          <div className={`flex items-center gap-2 ${getCategoryColor(results.category)}`}>
            {getCategoryIcon(results.category)}
            <span className="font-medium">{results.category}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* wRC+ */}
          <div className="text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
              wRC+
            </div>
            <div className="text-3xl font-bold text-white">
              {results.wrcPlus}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {results.wrcPlus > 100 ? `${results.performanceAboveAverage}% above avg` : 
               results.wrcPlus < 100 ? `${Math.abs(results.performanceAboveAverage)}% below avg` : 
               'League average'}
            </div>
          </div>

          {/* Efficiency Rating */}
          <div className="text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
              Efficiency Rating
            </div>
            <div className={`text-3xl font-bold ${getEfficiencyColor(parseFloat(results.efficiencyRating))}`}>
              {results.efficiencyRating}x
            </div>
            <div className="text-sm text-gray-500 mt-1">
              vs. average hitter
            </div>
          </div>

          {/* Surplus Value */}
          <div className="text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
              Surplus Value
            </div>
            <div className={`text-3xl font-bold ${parseFloat(results.surplusValue) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(parseFloat(results.surplusValue))}M
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {parseFloat(results.surplusValue) >= 0 ? 'Team saves' : 'Overpaid by'}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Player Salary
          </div>
          <div className="text-xl font-bold text-white">
            ${results.salaryInMillions}M
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Estimated WAR
          </div>
          <div className="text-xl font-bold text-white">
            {results.estimatedWAR}
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Market Value
          </div>
          <div className="text-xl font-bold text-white">
            ${results.marketValue}M
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            wRC+ Rank
          </div>
          <div className="text-xl font-bold text-white">
            {results.wrcPlus >= 140 ? 'Elite' :
             results.wrcPlus >= 120 ? 'Excellent' :
             results.wrcPlus >= 110 ? 'Above Avg' :
             results.wrcPlus >= 90 ? 'Average' :
             'Below Avg'}
          </div>
        </div>
      </div>

      {/* Positional Analysis (if position provided) */}
      {results.positionalData && (
        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Position-Adjusted Analysis ({results.position})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500">Positional Value Score</div>
              <div className={`text-lg font-bold ${
                results.positionalData.positionalValueScore >= 100 ? 'text-green-500' : 'text-red-500'
              }`}>
                {results.positionalData.positionalValueScore}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Salary vs Position Avg</div>
              <div className={`text-lg font-bold ${
                parseFloat(results.positionalData.salaryVsPositionAvg) > 0 ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {results.positionalData.salaryVsPositionAvg > 0 ? '+' : ''}{results.positionalData.salaryVsPositionAvg}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Performance vs Position Avg</div>
              <div className={`text-lg font-bold ${
                parseFloat(results.positionalData.performanceVsPositionAvg) > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {results.positionalData.performanceVsPositionAvg > 0 ? '+' : ''}{results.positionalData.performanceVsPositionAvg}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Summary with Formulas */}
      <div className="bg-gray-800 rounded p-4 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Calculation Breakdown
        </h4>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Performance Above Average:</div>
            <code className="text-white">
              ({results.wrcPlus} - 100) ÷ 100 = {results.performanceAboveAverage}%
            </code>
          </div>
          
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Estimated WAR (rough conversion):</div>
            <code className="text-white">
              {results.performanceAboveAverage}% × 10 = {results.estimatedWAR} WAR
            </code>
            <div className="text-xs text-gray-500 mt-1">*Assumes full-time player (600+ PA)</div>
          </div>
          
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Market Value:</div>
            <code className="text-white">
              {results.estimatedWAR} WAR × $8M = ${results.marketValue}M
            </code>
          </div>
          
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Surplus Value:</div>
            <code className="text-white">
              ${results.marketValue}M - ${results.salaryInMillions}M = ${results.surplusValue}M
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WRCPlusResultsDisplay;
