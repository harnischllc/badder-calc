import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User } from 'lucide-react';
import playerDataService from '../services/playerDataService';

const PlayerSearch = ({ onPlayerSelect, placeholder = "Search for a player..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const searchTimeout = useRef(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      await performSearch();
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const performSearch = async () => {
    if (query.length < 2) return;

    setLoading(true);
    setError('');

    try {
      const players = await playerDataService.searchPlayers(query, 15);
      setResults(players);
      setShowResults(true);
    } catch (err) {
      setError('Failed to search players. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player) => {
    onPlayerSelect(player);
    setQuery(player.fullName);
    setShowResults(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowResults(true);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  const getPositionDisplay = (position) => {
    if (!position) return '';
    
    const positionMap = {
      'P': 'Pitcher',
      'C': 'Catcher',
      '1B': 'First Base',
      '2B': 'Second Base',
      '3B': 'Third Base',
      'SS': 'Shortstop',
      'LF': 'Left Field',
      'CF': 'Center Field',
      'RF': 'Right Field',
      'DH': 'Designated Hitter'
    };

    return positionMap[position] || position;
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-gray-900 text-white rounded border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
          {results.map((player) => (
            <button
              key={player.id || player.player_id || Math.random()}
              onClick={() => handlePlayerSelect(player)}
              className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">
                    {player.fullName || player.name || 'Unknown Player'}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {/* Defensive: check for position and age */}
                    {player.primaryPosition?.name && (
                      <span>{getPositionDisplay(player.primaryPosition.abbreviation)}</span>
                    )}
                    {player.currentAge && (
                      <span className="ml-2">• Age {player.currentAge}</span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-500">
                  #{player.primaryNumber || 'N/A'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 2 && !loading && results.length === 0 && !error && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4">
          <div className="text-center text-gray-400">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No players found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSearch; 