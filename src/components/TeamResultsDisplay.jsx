// © 2024–2025 Harnisch LLC. All rights reserved.
// Developed in partnership with BadderSports and SwingBadder.
// Unauthorized commercial use or branding is prohibited.
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Award, Users } from 'lucide-react';

const TeamResultsDisplay = ({ results }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Elite Efficiency':
        return 'text-purple-500';
      case 'Above Average':
        return 'text-green-500';
      case 'Average':
        return 'text-yellow-500';
      case 'Below Average':
      case 'Inefficient':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Elite Efficiency':
        return <Award className="w-5 h-5" />;
      case 'Above Average':
        return <TrendingUp className="w-5 h-5" />;
      case 'Average':
        return <Activity className="w-5 h-5" />;
      case 'Below Average':
      case 'Inefficient':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 1.5) return 'text-purple-500';
    if (efficiency >= 1.2) return 'text-green-500';
    if (efficiency >= 0.9) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Primary Result */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white uppercase tracking-wider">
            Team Analysis
          </h3>
          <div className={`flex items-center gap-2 ${getCategoryColor(results.teamCategory)}`}>
            {getCategoryIcon(results.teamCategory)}
            <span className="font-medium">{results.teamCategory}</span>
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
              League avg: $8.0M
            </div>
          </div>

          {/* Efficiency */}
          <div className="text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
              Efficiency Rating
            </div>
            <div className={`text-3xl font-bold ${getEfficiencyColor(results.efficiency)}`}>
              {results.efficiency}x
            </div>
            <div className="text-sm text-gray-500 mt-1">
              vs. expected WAR
            </div>
          </div>

          {/* Projected Wins */}
          <div className="text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
              Projected Wins
            </div>
            <div className="text-3xl font-bold text-white">
              {results.projectedWins}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {results.winPercentage} W%
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Team WAR
          </div>
          <div className="text-xl font-bold text-white">
            {results.teamWAR}
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Payroll
          </div>
          <div className="text-xl font-bold text-white">
            ${results.teamPayroll}M
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Expected WAR
          </div>
          <div className="text-xl font-bold text-white">
            {results.expectedWAR}
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Surplus Value
          </div>
          <div className={`text-xl font-bold ${results.surplusValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${Math.abs(results.surplusValue).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Analysis Summary with Formulas */}
      <div className="bg-gray-800 rounded p-4 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Calculation Breakdown
        </h4>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Cost per WAR:</div>
            <code className="text-white">
              ${results.teamPayroll}M ÷ {results.teamWAR} WAR = ${results.costPerWAR}M per WAR
            </code>
          </div>
          
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Expected WAR (at market rate):</div>
            <code className="text-white">
              ${results.teamPayroll}M ÷ $8M per WAR = {results.expectedWAR} WAR
            </code>
          </div>
          
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Efficiency Rating:</div>
            <code className="text-white">
              {results.teamWAR} WAR ÷ {results.expectedWAR} expected WAR = {results.efficiency}x
            </code>
          </div>
          
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Projected Wins:</div>
            <code className="text-white">
              ({results.teamWAR} WAR ÷ 43 WAR) × 81 wins = {results.projectedWins} wins
            </code>
            <div className="text-xs text-gray-500 mt-1">*.500 team = 43 WAR baseline</div>
          </div>
          
          <div className="p-3 bg-gray-900 rounded">
            <div className="text-gray-400 mb-1">Surplus Value:</div>
            <code className="text-white">
              ({results.teamWAR} WAR × $8M) - ${results.teamPayroll}M = ${results.surplusValue.toFixed(1)}M
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamResultsDisplay;
