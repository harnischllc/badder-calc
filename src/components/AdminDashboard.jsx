import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, Edit, Trash2, Plus, Filter } from 'lucide-react';

const AdminDashboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);

  // Fetch all players on component mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/players?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
  };

  const handleDeletePlayer = async (playerId) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/players/${playerId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setPlayers(players.filter(p => p.player_id !== playerId));
      }
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedPlayers.length} players?`)) return;
    
    try {
      // Implement bulk delete logic
      console.log('Bulk delete:', selectedPlayers);
    } catch (error) {
      console.error('Error bulk deleting players:', error);
    }
  };

  const exportCSV = () => {
    const headers = ['player_id', 'player_name', 'season', 'war', 'wrc_plus', 'avg', 'obp', 'slg', 'home_runs', 'plate_appearances', 'salary_millions', 'team', 'position'];
    const csvContent = [
      headers.join(','),
      ...players.map(player => [
        player.player_id,
        player.name,
        player.latest_fangraphs_season,
        player.latest_war,
        player.latest_wrc_plus,
        '', // avg
        '', // obp
        '', // slg
        '', // home_runs
        '', // plate_appearances
        player.current_aav ? (player.current_aav / 1000000).toFixed(1) : '',
        player.team,
        player.position
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'player_stats_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading player data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Manage player data and team statistics</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Action Buttons */}
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">
          <Upload className="h-4 w-4" />
          Import CSV
        </button>

        {selectedPlayers.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedPlayers.length})
          </button>
        )}
      </div>

      {/* Player Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlayers(filteredPlayers.map(p => p.player_id));
                      } else {
                        setSelectedPlayers([]);
                      }
                    }}
                    checked={selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0}
                  />
                </th>
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Latest WAR</th>
                <th className="px-4 py-3 text-left">wRC+</th>
                <th className="px-4 py-3 text-left">Salary ($M)</th>
                <th className="px-4 py-3 text-left">Season</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.player_id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.player_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlayers([...selectedPlayers, player.player_id]);
                        } else {
                          setSelectedPlayers(selectedPlayers.filter(id => id !== player.player_id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{player.name}</td>
                  <td className="px-4 py-3">{player.team || 'N/A'}</td>
                  <td className="px-4 py-3">{player.position || 'N/A'}</td>
                  <td className="px-4 py-3">{player.latest_war || 'N/A'}</td>
                  <td className="px-4 py-3">{player.latest_wrc_plus || 'N/A'}</td>
                  <td className="px-4 py-3">
                    {player.current_aav ? (player.current_aav / 1000000).toFixed(1) : 'N/A'}
                  </td>
                  <td className="px-4 py-3">{player.latest_fangraphs_season || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlayer(player)}
                        className="p-1 text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.player_id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 text-sm text-gray-400">
        Showing {filteredPlayers.length} of {players.length} players
      </div>
    </div>
  );
};

export default AdminDashboard; 