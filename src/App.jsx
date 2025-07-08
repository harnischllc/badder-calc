import React, { useState, useEffect } from 'react';
import { Calculator, X, History } from 'lucide-react';
import ModeSelector from './components/ModeSelector';
import WARTypeSelector from './components/WARTypeSelector';
import ExampleContracts from './components/ExampleContracts';
import CalculatorForm from './components/CalculatorForm';
import HistoryPanel from './components/HistoryPanel';
import ResultsDisplay from './components/ResultsDisplay';
import TeamResultsDisplay from './components/TeamResultsDisplay';
import { useCalculatorHistory } from './hooks/useCalculatorHistory';
import { useURLParams } from './hooks/useURLParams';
import { 
  calculateContractMetrics,
  calculateTeamMetrics, 
  validateInputs,
  validateTeamInputs
} from './utils/calculations';
import { LEAGUE_DATA } from './utils/constants';

const WARValueCalculator = () => {
  const [mode, setMode] = useState('individual');
  const [salary, setSalary] = useState('');
  const [war, setWar] = useState('');
  const [teamPayroll, setTeamPayroll] = useState('');
  const [teamWAR, setTeamWAR] = useState('');
  const [warType, setWarType] = useState('avg');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({ salary: '', war: '', teamPayroll: '', teamWAR: '' });
  
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
        LEAGUE_DATA
      );
      
      results.warType = warType;
      results.mode = 'individual';
      
      setResults(results);
      
      addToHistory(results);
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
      setResults(results);
      
      addToHistory(results);
    }
  };

  const handleClear = () => {
    setSalary('');
    setWar('');
    setTeamPayroll('');
    setTeamWAR('');
    setResults(null);
    setErrors({ salary: '', war: '', teamPayroll: '', teamWAR: '' });
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
            teamPayroll={teamPayroll}
            setTeamPayroll={setTeamPayroll}
            teamWAR={teamWAR}
            setTeamWAR={setTeamWAR}
            warType={warType}
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
              <TeamResultsDisplay results={results} />
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 md:mt-8 text-gray-500 text-xs sm:text-sm">
          <p>League averages based on 2024 MLB data</p>
          <p className="mt-1">Market rate: ~$8M per WAR • League avg team: ~43 WAR</p>
        </div>
      </div>
    </div>
  );
};

export default WARValueCalculator;
