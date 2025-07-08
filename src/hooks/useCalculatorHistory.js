import { useState, useEffect } from 'react';

const HISTORY_KEY = 'contractWARHistory';

export const useCalculatorHistory = () => {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = (newHistory) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  // Add new entry to history
  const addToHistory = (results) => {
    const newEntry = {
      ...results,
      name: results.mode === 'individual' 
        ? `${results.playerWAR} ${results.warType === 'avg' ? 'WAR' : results.warType} @ $${(results.playerSalary / 1000000).toFixed(1)}M`
        : `Team: ${results.teamWAR} WAR @ $${results.teamPayroll}M`,
      date: new Date().toLocaleDateString(),
      category: results.mode === 'individual' ? results.warValueCategory : results.teamCategory,
      costPerWAR: results.costPerWAR
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    saveHistory(updatedHistory);
  };

  // Clear all history
  const clearHistory = () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  // Toggle history visibility
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return {
    history,
    showHistory,
    addToHistory,
    clearHistory,
    toggleHistory
  };
};
