import React from 'react';
import { Info } from 'lucide-react';

export const InputField = ({ label, value, onChange, placeholder, error, tooltip }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
        {tooltip && (
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-gray-800 text-white rounded border ${
          error ? 'border-red-500' : 'border-gray-700'
        } focus:outline-none focus:border-red-500 transition-colors`}
        step="0.1"
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export const MetricCard = ({ label, value, subtitle, trend, highlight = false }) => {
  return (
    <div className={`bg-gray-800 rounded p-4 border ${
      highlight ? 'border-red-500' : 'border-gray-700'
    }`}>
      <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold ${
        highlight ? 'text-red-500' : 'text-white'
      }`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-500 mt-1">
          {subtitle}
        </div>
      )}
      {trend && (
        <div className={`text-sm mt-2 ${
          trend > 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};
