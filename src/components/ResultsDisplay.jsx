// © 2024–2025 Harnisch LLC. All rights reserved.
// Developed in partnership with BadderSports and SwingBadder.
// Unauthorized commercial use or branding is prohibited.
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Award, AlertCircle } from 'lucide-react';

const ResultsDisplay = ({ results }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Historic Bargain':
        return 'text-purple-500';
      case 'High Value':
        return 'text-green-500';
      case 'Average':
        return 'text-yellow-500';
      case 'Poor Value':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Historic Bargain':
        return <Award className="w-5 h-5" />;
      case 'High Value':
        return <TrendingUp className="w-5 h-5" />;
      case 'Average':
        return <Activity className="w-5 h-5" />;
      case 'Poor Value':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 2) return 'text-purple-500';
    if (efficiency >= 1.5) return 'text-green-500';
    if (efficiency >= 1) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Primary Result - $/WAR */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white uppercase tracking-wider">
            Contract Analysis
          </h3>
          <div className={`flex items-center gap-2 ${getCategoryColor(results.warValueCategory)}`}>
            {getCategoryIcon(results.warValueCategory)}
            <span className="font-medium">{results.warValueCategory}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cost per WAR */}
          <div className="text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
              Cost per WAR
            </div>
            <div className="text-3xl font-bold text-white">
              ${results.costPerWAR}M
            </div>
            <div className="text-sm text-gray-500 mt-1">
              League avg: ${results.leagueAvgPerWAR}M
            </div>
          </div>

          {/* Contract Efficiency */}
          <div className="text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
              Contract Efficiency
            </div>
            <div className={`text-3xl font-bold ${getEfficiencyColor(results.contractEfficiency)}`}>
              {results.contractEfficiency}x
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {results.contractEfficiency >= 1 ? 'Above' : 'Below'} average
            </div>
          </div>

          {/* Surplus Value */}
          <div className="text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
              Surplus Value
            </div>
            <div className={`text-3xl font-bold ${results.surplusValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(results.surplusValue).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {results.surplusValue >= 0 ? 'Team saves' : 'Overpaid by'}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Player WAR
          </div>
          <div className="text-xl font-bold text-white">
            {results.playerWAR}
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Player Salary
          </div>
          <div className="text-xl font-bold text-white">
            ${(results.playerSalary / 1000000).toFixed(1)}M
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Market Value
          </div>
          <div className="text-xl font-bold text-white">
            ${results.marketValue.toFixed(1)}M
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Percentile
          </div>
          <div className="text-xl font-bold text-white">
            {results.percentileRank}%
          </div>
        </div>
      </div>

      {/* Analysis Summary with Formulas */}
      <div className="bg-gray-800 rounded p-4 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Calculation Breakdown ({results.year || 2024})
        </h4>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Cost per WAR:</div>
            <code className="text-white">
              ${(results.playerSalary / 1000000).toFixed(1)}M ÷ {results.playerWAR} WAR = ${results.costPerWAR}M per WAR
            </code>
          </div>
          
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Contract Efficiency (Fixed):</div>
            <code className="text-white">
              ({results.playerWAR} WAR × ${results.leagueAvgPerWAR}M) ÷ ${(results.playerSalary / 1000000).toFixed(1)}M = {results.contractEfficiency}x
            </code>
            <div className="text-xs text-gray-500 mt-1">*Now uses same baseline as surplus value: ${results.leagueAvgPerWAR}M per WAR</div>
          </div>
          
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Surplus Value:</div>
            <code className="text-white">
              ({results.playerWAR} WAR × ${results.leagueAvgPerWAR}M) - ${(results.playerSalary / 1000000).toFixed(1)}M = ${results.surplusValue.toFixed(1)}M
            </code>
            <div className="text-xs text-gray-500 mt-1">*Market rate: ${results.leagueAvgPerWAR}M per WAR</div>
          </div>
          
          {results.year && results.year !== 2024 && (
            <div className="p-3 bg-blue-900 rounded border border-blue-700">
              <div className="text-blue-300 mb-1">Historical Context ({results.year}):</div>
              <div className="text-blue-200 text-xs">
                League minimum: ${(results.leagueMinimum / 1000).toFixed(0)}K • Market rate: ${(results.marketRatePerWAR / 1000000).toFixed(1)}M per WAR
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
