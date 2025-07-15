import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2 } from 'lucide-react';

const TeamSearch = ({ onTeamSelect, payrollType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'https://badder-calc-backend.onrender.com';

  useEffect(() => {
    // Handle clicks outside to close dropdown
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `${API_URL}/api/search/teams?q=${encodeURIComponent(searchTerm)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.ok) {
          const teams = await response.json();
          setSearchResults(teams);
          setShowDropdown(teams.length > 0);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, API_URL]);

  const handleKeyDown = (e) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          selectTeam(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  const selectTeam = (team) => {
    const teamData = {
      teamName: team.team_name,
      totalPayroll: team.total_payroll,
      activePayroll: team.active_payroll,
      teamWar: team.team_war,
      season: team.season
    };

    onTeamSelect(teamData);
    setSearchTerm('');
    setShowDropdown(false);
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const getPayrollDisplay = (team) => {
    if (payrollType === 'active') {
      return `Active: $${team.active_payroll}M`;
    }
    return `Total: $${team.total_payroll}M`;
  };

  return (
    <div ref={searchRef} className="relative mb-4">
      <div className="bg-gray-800 rounded p-4 border border-gray-700">
        <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Search Team
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Type team name to search..."
            className="w-full pl-10 pr-10 py-3 bg-gray-900 text-white rounded border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
          )}
          {isSearching && (
            <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-gray-900 rounded-md shadow-lg border border-gray-700 max-h-60 overflow-auto">
            {searchResults.map((team, index) => (
              <button
                key={`${team.team_name}-${team.season}`}
                onClick={() => selectTeam(team)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center justify-between transition-colors ${
                  index === selectedIndex ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-white font-medium">{team.team_name}</div>
                    <div className="text-sm text-gray-400">
                      {team.season} • {getPayrollDisplay(team)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  WAR: {team.team_war}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showDropdown && searchResults.length === 0 && searchTerm.length >= 2 && !isSearching && (
          <div className="absolute z-10 mt-1 w-full bg-gray-900 rounded-md shadow-lg border border-gray-700 p-4">
            <p className="text-gray-400 text-sm text-center">
              No teams found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Search database for team stats • Use arrow keys to navigate • Press Enter to select
      </p>
    </div>
  );
};

export default TeamSearch;
