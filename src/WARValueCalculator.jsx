// © 2024–2025 Harnisch LLC. All rights reserved.
// Developed in partnership with BadderSports and SwingBadder.
// Unauthorized commercial use or branding is prohibited.

import React, { useState, useEffect } from 'react';
import { Calculator, X, History } from 'lucide-react';
import ModeSelector from './components/ModeSelector';
import WARTypeSelector from './components/WARTypeSelector';
import PositionSelector from './components/PositionSelector';
import ExampleContracts from './components/ExampleContracts';
import CalculatorForm from './components/CalculatorForm';
import HistoryPanel from './components/HistoryPanel';
import ResultsDisplay from './components/ResultsDisplay';
import TeamResultsDisplay from './components/TeamResultsDisplay';
import WRCPlusResultsDisplay from './components/WRCPlusResultsDisplay';
import { useCalculatorHistory } from './hooks/useCalculatorHistory';
import { useURLParams } from './hooks/useURLParams';
import { 
  calculateContractMetrics,
  calculateTeamMetrics,
  calculateWRCPlusValue,
  validateInputs,
  validateTeamInputs,
  validateWRCPlusInputs
} from './utils/calculations';
import { LEAGUE_DATA } from './utils/constants';

const WARValueCalculator = () => {
  const [mode, setMode] = useState('individual');
  const [salary, setSalary] = useState('');
  const [war, setWar] = useState('');
  const [wrcPlus, setWrcPlus] = useState('');
  const [position, setPosition] = useState('');
  const [teamPayroll, setTeamPayroll] = useState('');
  const [teamWAR, setTeamWAR] = useState('');
  const [warType, setWarType] = useState('avg');
  const [payrollType, setPayrollType] = useState('total');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({ salary: '', war: '', wrcPlus: '', teamPayroll: '', teamWAR: '' });
  
  const { history, showHistory, addToHistory, clearHistory, toggleHistory } = useCalculatorHistory();
  const { loadFromURL } = useURLParams(salary, war);

  // Load URL params on mount
  useEffect(() => {
    const { salary: urlSalary, war: urlWar } = loadFromURL();
    if (urlSalary && urlWar) {
      setSalary(urlSalary);
      setWar(urlWar);
    }
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    handleClear();
  };

  const handleExampleSelect = (example) => {
    if (mode === 'individual') {
      setSalary(example.salary);
      setWar(example.war);
      setPosition(example.position || '');
    } else if (mode === 'wrcplus') {
      setSalary(example.salary);
      setWrcPlus(example.wrcPlus);
      setPosition(example.position || '');
    } else {
      setTeamPayroll(example.payroll);
      setTeamWAR(example.war);
    }
  };

  const handleCalculate = () => {
    if (mode === 'individual') {
      const validation = validateInputs(salary, war);
      setErrors({ ...errors, ...validation.errors });
      
      if (!validation.isValid) return;
      
      const results = calculateContractMetrics(
        parseFloat(salary), 
        parseFloat(war), 
        LEAGUE_DATA,
        position
      );
      
      results.warType = warType;
      results.mode = 'individual';
      results.position = position;
      
      setResults(results);
      addToHistory(results);
    } else if (mode === 'wrcplus') {
      const validation = validateWRCPlusInputs(salary, wrcPlus);
      setErrors({ ...errors, ...validation.errors });
      
      if (!validation.isValid) return;
      
      const results = calculateWRCPlusValue(
        parseFloat(salary),
        parseFloat(wrcPlus),
        position
      );
      
      results.mode = 'wrcplus';
      results.position = position;
      
      setResults(results);
      addToHistory({
        ...results,
        name: `${wrcPlus} wRC+ @ $${parseFloat(salary).toFixed(1)}M`,
        date: new Date().toLocaleDateString(),
        costPerWAR: 'N/A',
        category: results.category
      });
    } else {
      const validation = validateTeamInputs(teamPayroll, teamWAR);
      setErrors({ ...errors, ...validation.errors });
      
      if (!validation.isValid) return;
      
      const results = calculateTeamMetrics(
        parseFloat(teamPayroll), 
        parseFloat(teamWAR), 
        LEAGUE_DATA
      );
      
      results.mode = 'team';
      results.payrollType = payrollType;
      setResults(results);
      
      addToHistory(results);
    }
  };

  const handleClear = () => {
    setSalary('');
    setWar('');
    setWrcPlus('');
    setPosition('');
    setTeamPayroll('');
    setTeamWAR('');
    setResults(null);
    setErrors({ salary: '', war: '', wrcPlus: '', teamPayroll: '', teamWAR: '' });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Calculator className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider">
              WAR Value Calculator
            </h1>
          </div>
          <p className="text-gray-400 text-base md:text-lg px-4">
            Analyze MLB contracts from a performance vs. salary perspective
          </p>
        </div>

        {/* Mode Selector */}
        <ModeSelector mode={mode} onModeChange={handleModeChange} />

        {/* WAR Type Selector (Individual Mode Only) */}
        {mode === 'individual' && (
          <WARTypeSelector warType={warType} onWarTypeChange={setWarType} />
        )}

        {/* Position Selector (Individual and wRC+ modes) */}
        {(mode === 'individual' || mode === 'wrcplus') && (
          <PositionSelector position={position} onPositionChange={setPosition} />
        )}

        {/* Example Contracts */}
        <ExampleContracts mode={mode} onExampleSelect={handleExampleSelect} />

        {/* Main Calculator Card */}
        <div className="bg-gray-900 rounded-lg p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-800">
          {/* Calculator Form */}
          <CalculatorForm
            mode={mode}
            salary={salary}
            setSalary={setSalary}
            war={war}
            setWar={setWar}
            wrcPlus={wrcPlus}
            setWrcPlus={setWrcPlus}
            teamPayroll={teamPayroll}
            setTeamPayroll={setTeamPayroll}
            teamWAR={teamWAR}
            setTeamWAR={setTeamWAR}
            warType={warType}
            payrollType={payrollType}
            setPayrollType={setPayrollType}
            position={position}
            setPosition={setPosition}
            errors={errors}
          />

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 mb-4 md:mb-6">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded font-medium transition-colors uppercase tracking-wider text-sm sm:text-base"
            >
              Calculate
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
              aria-label="Clear form"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={toggleHistory}
              className="px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors relative"
              aria-label="Show history"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* History Panel */}
          {showHistory && (
            <HistoryPanel history={history} onClearHistory={clearHistory} />
          )}

          {/* Results Display */}
          {results && (
            results.mode === 'individual' ? 
              <ResultsDisplay results={results} /> : 
            results.mode === 'wrcplus' ?
              <WRCPlusResultsDisplay results={results} /> :
              <TeamResultsDisplay results={results} />
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 md:mt-8 text-gray-500 text-xs sm:text-sm">
          <p>League averages based on 2024 MLB data</p>
          <p className="mt-1">
            Market rate: ~${LEAGUE_DATA.marketRatePerWAR / 1000000}M per WAR • 
            League avg team: ~{LEAGUE_DATA.avgTeamWAR} WAR • 
            League avg wRC+: 100
          </p>
          <p className="mt-2 text-gray-600 italic">
            Note: Mid-season projections are based on current pace
          </p>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p>
              Visit us at{' '}
              <a 
                href="https://baddersports.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                BadderSports.com
              </a>
              {' '}• Check out the show -{' '}
              <a 
                href="https://www.youtube.com/channel/UCvkFXHG5mZyQfsmmf7aU5lQ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                @swingbadderpodcast
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WARValueCalculator;
