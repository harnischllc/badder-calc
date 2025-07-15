// © 2024–2025 Harnisch LLC. All rights reserved.
// Developed in partnership with BadderSports and SwingBadder.
// Unauthorized commercial use or branding is prohibited.

import React, { useState, useEffect } from 'react';
import { Upload, Download, Trash2, Plus, Database, Users, Building2, RefreshCw, Save, Check, LogOut, ArrowUpDown } from 'lucide-react';
import Papa from 'papaparse';

const AdminDashboard = ({ onExit }) => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editedPlayers, setEditedPlayers] = useState({});
  const [editedTeams, setEditedTeams] = useState({});
  const [activeTab, setActiveTab] = useState('players');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerSort, setPlayerSort] = useState({ field: 'name', order: 'asc' });
  const [teamSort, setTeamSort] = useState({ field: 'teamName', order: 'asc' });

  // API URL - Using Vite environment variable
  const API_URL = import.meta.env.VITE_API_URL || 'https://badder-calc-backend.onrender.com';

  useEffect(() => {
    // Load data from API on component mount
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [playersRes, teamsRes] = await Promise.all([
        fetch(`${API_URL}/api/players`),
        fetch(`${API_URL}/api/teams`)
      ]);
      
      if (playersRes.ok) {
        const playersData = await playersRes.json();
        setPlayers(playersData.map(p => ({
          id: p.id,
          name: p.name,
          playerId: p.player_id,
          season: p.season,
          position: p.position || '',
          war: parseFloat(p.war) || 0,
          fwar: parseFloat(p.fwar) || 0,
          bwar: parseFloat(p.bwar) || 0,
          wrcPlus: parseFloat(p.wrc_plus) || 0,
          salary: parseFloat(p.salary) || 0
        })));
      }
      
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData.map(t => ({
          id: t.id,
          teamName: t.team_name,
          season: t.season,
          totalPayroll: parseFloat(t.total_payroll) || 0,
          activePayroll: parseFloat(t.active_payroll) || 0,
          teamWar: parseFloat(t.team_war) || 0
        })));
      }
      
      // Clear edited tracking after loading fresh data
      setEditedPlayers({});
      setEditedTeams({});
    } catch (error) {
      console.error('Failed to load data:', error);
      showMessage('Failed to load data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  // Sorting functions
  const sortPlayers = (field) => {
    const newOrder = playerSort.field === field && playerSort.order === 'asc' ? 'desc' : 'asc';
    setPlayerSort({ field, order: newOrder });
    
    const sorted = [...players].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      // Handle numeric vs string sorting
      if (typeof aVal === 'number') {
        return newOrder === 'asc' ? aVal - bVal : bVal - aVal;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        return newOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
    });
    
    setPlayers(sorted);
  };

  const sortTeams = (field) => {
    const newOrder = teamSort.field === field && teamSort.order === 'asc' ? 'desc' : 'asc';
    setTeamSort({ field, order: newOrder });
    
    const sorted = [...teams].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      // Handle numeric vs string sorting
      if (typeof aVal === 'number') {
        return newOrder === 'asc' ? aVal - bVal : bVal - aVal;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        return newOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
    });
    
    setTeams(sorted);
  };

  // Check for duplicate player
  const isDuplicatePlayer = (playerId, season, currentId = null) => {
    return players.some(p => 
      p.playerId === playerId && 
      p.season === season && 
      p.id !== currentId
    );
  };

  // Player Management Functions
  const handlePlayerFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validPlayers = results.data.filter(player => 
          player.name && player.playerId && player.season
        ).map(player => ({
          name: player.name || '',
          playerId: player.playerId || '',
          season: parseInt(player.season) || new Date().getFullYear(),
          position: player.position || '',
          war: parseFloat(player.war) || 0,
          fwar: parseFloat(player.fwar) || 0,
          bwar: parseFloat(player.bwar) || 0,
          wrcPlus: parseFloat(player.wrcPlus) || 0,
          salary: parseFloat(player.salary) || 0
        }));

        // Check for duplicates in import
        const duplicates = [];
        const uniquePlayers = validPlayers.filter(player => {
          const isDupe = isDuplicatePlayer(player.playerId, player.season);
          if (isDupe) {
            duplicates.push(`${player.name} (${player.season})`);
            return false;
          }
          return true;
        });

        if (duplicates.length > 0) {
          showMessage(`Skipped ${duplicates.length} duplicate players: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '...' : ''}`, 'warning');
        }

        try {
          const response = await fetch(`${API_URL}/api/players/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ players: uniquePlayers })
          });

          if (response.ok) {
            const result = await response.json();
            showMessage(`Imported ${result.imported} players successfully`);
            loadData(); // Reload data
          } else {
            showMessage('Failed to import players', 'error');
          }
        } catch (error) {
          console.error('Import error:', error);
          showMessage('Error importing players', 'error');
        }
      },
      error: (error) => {
        showMessage('Error parsing CSV file', 'error');
        console.error('CSV parsing error:', error);
      }
    });
  };

  const exportPlayers = () => {
    const csv = Papa.unparse(players.map(p => ({
      name: p.name,
      playerId: p.playerId,
      season: p.season,
      position: p.position,
      war: p.war,
      fwar: p.fwar,
      bwar: p.bwar,
      wrcPlus: p.wrcPlus,
      salary: p.salary
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'players_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addPlayer = async () => {
    const newPlayer = {
      name: 'New Player',
      player_id: `temp_${Date.now()}`,
      season: new Date().getFullYear(),
      position: '',
      war: 0,
      fwar: 0,
      bwar: 0,
      wrc_plus: 0,
      salary: 0
    };

    try {
      const response = await fetch(`${API_URL}/api/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlayer)
      });

      if (response.ok) {
        loadData();
        showMessage('Player added successfully');
      } else {
        showMessage('Failed to add player', 'error');
      }
    } catch (error) {
      console.error('Add player error:', error);
      showMessage('Error adding player', 'error');
    }
  };

  // Update local state only - don't save to database yet
  const updatePlayerLocally = (id, field, value) => {
    const player = players.find(p => p.id === id);
    
    // Check for duplicate when updating playerId or season
    if ((field === 'playerId' || field === 'season') && player) {
      const checkPlayerId = field === 'playerId' ? value : player.playerId;
      const checkSeason = field === 'season' ? value : player.season;
      
      if (isDuplicatePlayer(checkPlayerId, checkSeason, id)) {
        showMessage(`Duplicate player: ${player.name} already exists for ${checkSeason}`, 'error');
        return;
      }
    }
    
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
    setEditedPlayers({ ...editedPlayers, [id]: true });
  };

  // Save player to database
  const savePlayer = async (id) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

    // Final duplicate check before saving
    if (isDuplicatePlayer(player.playerId, player.season, id)) {
      showMessage(`Cannot save: Duplicate player ${player.name} for ${player.season}`, 'error');
      return;
    }

    // Validate required fields
    if (!player.name || !player.playerId || !player.season) {
      showMessage('Name, Player ID, and Season are required', 'error');
      return;
    }

    // Validate numeric fields
    if (player.salary < 0 || player.war < -10 || player.war > 20) {
      showMessage('Please check salary and WAR values', 'error');
      return;
    }

    const updatedPlayer = {
      ...player,
      player_id: player.playerId,
      wrc_plus: player.wrcPlus
    };

    try {
      const response = await fetch(`${API_URL}/api/players/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPlayer)
      });

      if (response.ok) {
        // Remove from edited tracking
        const newEditedPlayers = { ...editedPlayers };
        delete newEditedPlayers[id];
        setEditedPlayers(newEditedPlayers);
        showMessage('Player saved successfully!');
      } else {
        showMessage('Failed to save player', 'error');
        loadData(); // Reload to revert changes
      }
    } catch (error) {
      console.error('Save player error:', error);
      showMessage('Error saving player', 'error');
      loadData(); // Reload to revert changes
    }
  };

  const deletePlayer = async (id) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/players/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPlayers(players.filter(p => p.id !== id));
        showMessage('Player deleted successfully');
      } else {
        showMessage('Failed to delete player', 'error');
      }
    } catch (error) {
      console.error('Delete player error:', error);
      showMessage('Error deleting player', 'error');
    }
  };

  // Team Management Functions
  const handleTeamFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validTeams = results.data.filter(team => 
          team.teamName && team.season
        ).map(team => ({
          teamName: team.teamName || '',
          season: parseInt(team.season) || new Date().getFullYear(),
          totalPayroll: parseFloat(team.totalPayroll) || 0,
          activePayroll: parseFloat(team.activePayroll) || 0,
          teamWar: parseFloat(team.teamWar) || 0
        }));

        try {
          const response = await fetch(`${API_URL}/api/teams/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teams: validTeams })
          });

          if (response.ok) {
            const result = await response.json();
            showMessage(`Imported ${result.imported} teams successfully`);
            loadData(); // Reload data
          } else {
            showMessage('Failed to import teams', 'error');
          }
        } catch (error) {
          console.error('Import error:', error);
          showMessage('Error importing teams', 'error');
        }
      },
      error: (error) => {
        showMessage('Error parsing CSV file', 'error');
        console.error('CSV parsing error:', error);
      }
    });
  };

  const exportTeams = () => {
    const csv = Papa.unparse(teams.map(t => ({
      teamName: t.teamName,
      season: t.season,
      totalPayroll: t.totalPayroll,
      activePayroll: t.activePayroll,
      teamWar: t.teamWar
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'teams_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addTeam = async () => {
    const newTeam = {
      team_name: 'New Team',
      season: new Date().getFullYear(),
      total_payroll: 0,
      active_payroll: 0,
      team_war: 0
    };

    try {
      const response = await fetch(`${API_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeam)
      });

      if (response.ok) {
        loadData();
        showMessage('Team added successfully');
      } else {
        showMessage('Failed to add team', 'error');
      }
    } catch (error) {
      console.error('Add team error:', error);
      showMessage('Error adding team', 'error');
    }
  };

  // Update local state only - don't save to database yet
  const updateTeamLocally = (id, field, value) => {
    setTeams(teams.map(t => t.id === id ? { ...t, [field]: value } : t));
    setEditedTeams({ ...editedTeams, [id]: true });
  };

  // Save team to database
  const saveTeam = async (id) => {
    const team = teams.find(t => t.id === id);
    if (!team) return;

    // Validate required fields
    if (!team.teamName || !team.season) {
      showMessage('Team Name and Season are required', 'error');
      return;
    }

    // Validate numeric fields
    if (team.totalPayroll < 0 || team.activePayroll < 0 || team.teamWar < 0 || team.teamWar > 100) {
      showMessage('Please check payroll and WAR values', 'error');
      return;
    }

    const updatedTeam = {
      ...team,
      team_name: team.teamName,
      total_payroll: team.totalPayroll,
      active_payroll: team.activePayroll,
      team_war: team.teamWar
    };

    try {
      const response = await fetch(`${API_URL}/api/teams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTeam)
      });

      if (response.ok) {
        // Remove from edited tracking
        const newEditedTeams = { ...editedTeams };
        delete newEditedTeams[id];
        setEditedTeams(newEditedTeams);
        showMessage('Team saved successfully!');
      } else {
        showMessage('Failed to save team', 'error');
        loadData(); // Reload to revert changes
      }
    } catch (error) {
      console.error('Save team error:', error);
      showMessage('Error saving team', 'error');
      loadData(); // Reload to revert changes
    }
  };

  const deleteTeam = async (id) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/teams/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTeams(teams.filter(t => t.id !== id));
        showMessage('Team deleted successfully');
      } else {
        showMessage('Failed to delete team', 'error');
      }
    } catch (error) {
      console.error('Delete team error:', error);
      showMessage('Error deleting team', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Database className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider">
              Admin Dashboard
            </h1>
            <button
              onClick={onExit}
              className="ml-4 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm transition-colors"
              title="Exit Admin"
            >
              <LogOut className="w-4 h-4" />
              Exit
            </button>
          </div>
          <p className="text-gray-400 text-base md:text-lg px-4">
            Manage player and team data for WAR Value Calculator
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'error' ? 'bg-red-900 text-red-100' : 
            message.type === 'warning' ? 'bg-yellow-900 text-yellow-100' :
            'bg-green-900 text-green-100'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'players' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Players ({players.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'teams' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Teams ({teams.length})
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="bg-gray-900 rounded-lg p-6 shadow-2xl border border-gray-800">
            <div className="flex flex-wrap gap-4 mb-6">
              <label className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Import Players CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handlePlayerFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportPlayers}
                disabled={players.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Players CSV
              </button>
              <button
                onClick={addPlayer}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Player
              </button>
            </div>

            {/* Players Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading players...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2">
                        <button onClick={() => sortPlayers('name')} className="flex items-center gap-1 hover:text-red-500">
                          Name <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left p-2">
                        <button onClick={() => sortPlayers('playerId')} className="flex items-center gap-1 hover:text-red-500">
                          Player ID <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left p-2">
                        <button onClick={() => sortPlayers('season')} className="flex items-center gap-1 hover:text-red-500">
                          Season <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left p-2">Position</th>
                      <th className="text-left p-2">
                        <button onClick={() => sortPlayers('war')} className="flex items-center gap-1 hover:text-red-500">
                          WAR <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left p-2">fWAR</th>
                      <th className="text-left p-2">bWAR</th>
                      <th className="text-left p-2">wRC+</th>
                      <th className="text-left p-2">
                        <button onClick={() => sortPlayers('salary')} className="flex items-center gap-1 hover:text-red-500">
                          Salary ($M) <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr key={player.id} className={`border-b border-gray-800 hover:bg-gray-800 ${
                        editedPlayers[player.id] ? 'bg-yellow-900/20' : ''
                      }`}>
                        <td className="p-2">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => updatePlayerLocally(player.id, 'name', e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={player.playerId}
                            onChange={(e) => updatePlayerLocally(player.id, 'playerId', e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1900"
                            max="2100"
                            value={player.season}
                            onChange={(e) => updatePlayerLocally(player.id, 'season', parseInt(e.target.value) || new Date().getFullYear())}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={player.position}
                            onChange={(e) => updatePlayerLocally(player.id, 'position', e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-full"
                          >
                            <option value="">-</option>
                            <option value="C">C</option>
                            <option value="1B">1B</option>
                            <option value="2B">2B</option>
                            <option value="3B">3B</option>
                            <option value="SS">SS</option>
                            <option value="LF">LF</option>
                            <option value="CF">CF</option>
                            <option value="RF">RF</option>
                            <option value="DH">DH</option>
                            <option value="SP">SP</option>
                            <option value="RP">RP</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            value={player.war}
                            onChange={(e) => updatePlayerLocally(player.id, 'war', parseFloat(e.target.value) || 0)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            value={player.fwar}
                            onChange={(e) => updatePlayerLocally(player.id, 'fwar', parseFloat(e.target.value) || 0)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            value={player.bwar}
                            onChange={(e) => updatePlayerLocally(player.id, 'bwar', parseFloat(e.target.value) || 0)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            value={player.wrcPlus}
                            onChange={(e) => updatePlayerLocally(player.id, 'wrcPlus', parseFloat(e.target.value) || 0)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={player.salary}
                            onChange={(e) => updatePlayerLocally(player.id, 'salary', parseFloat(e.target.value) || 0)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            {editedPlayers[player.id] ? (
                              <button
                                onClick={() => savePlayer(player.id)}
                                className="text-green-400 hover:text-green-300"
                                title="Save changes"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            ) : (
                              <Check className="w-4 h-4 text-gray-500" />
                            )}
                            <button
                              onClick={() => deletePlayer(player.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete player"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="bg-gray-900 rounded-lg p-6 shadow-2xl border border-gray-800">
            <div className="flex flex-wrap gap-4 mb-6">
              <label className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Import Teams CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleTeamFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportTeams}
                disabled={teams.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Teams CSV
              </button>
              <button
                onClick={addTeam}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Team
              </button>
            </div>

            {/* Teams Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading teams...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2">
                        <button onClick={() => sortTeams('teamName')} className="flex items-center gap-1 hover:text-red-500">
                          Team Name <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left p-2">
                        <button onClick={() => sortTeams('season')} className="flex items-center gap-1 hover:text-red-500">
                          Season <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left p-2">
                        <button onClick={() => sortTeams('totalPayroll')} className="flex items-center gap-1 hover:text-red-500">
                          Total Payroll ($M) <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left p-2">Active Payroll ($M)</th>
                      <th className="text-left p-2">
                        <button onClick={() => sortTeams('teamWar')} className="flex items-center gap-1 hover:text-red-500">
                          Team WAR <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr key={team.id} className={`border-b border-gray-800 hover:bg-gray-800 ${
                        editedTeams[team.id] ? 'bg-yellow-900/20' : ''
                      }`}>
                        <td className="p-2">
                          <input
                            type="text"
                            value={team.teamName}
                            onChange={(e) => updateTeamLocally(team.id, 'teamName', e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1900"
                            max="2100"
                            value={team.season}
                            onChange={(e) => updateTeamLocally(team.id, 'season', parseInt(e.target.value) || new Date().getFullYear())}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={team.totalPayroll}
                            onChange={(e) => updateTeamLocally(team.id, 'totalPayroll', parseFloat(e.target.value) || 0)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-32"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={team.activePayroll}
                            onChange={(e) => updateTeamLocally(team.id, 'activePayroll', parseFloat(e.target.value) || 0)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-32"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={team.teamWar}
                            onChange={(e) => updateTeamLocally(team.id, 'teamWar', parseFloat(e.target.value) || 0)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            {editedTeams[team.id] ? (
                              <button
                                onClick={() => saveTeam(team.id)}
                                className="text-green-400 hover:text-green-300"
                                title="Save changes"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            ) : (
                              <Check className="w-4 h-4 text-gray-500" />
                            )}
                            <button
                              onClick={() => deleteTeam(team.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete team"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Connected to PostgreSQL database</p>
          <p className="mt-1">Click the save icon after making changes to commit to database</p>
          <p className="mt-1 text-yellow-500">Yellow background = unsaved changes</p>
          <p className="mt-1 text-red-500">Duplicate players (same ID & season) will be rejected</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
