// © 2024–2025 Harnisch LLC. All rights reserved.
// Developed in partnership with BadderSports and SwingBadder.
// Unauthorized commercial use or branding is prohibited.

import React, { useState, useEffect } from 'react';
import { Upload, Download, Trash2, Plus, Database, Users, Building2 } from 'lucide-react';
import Papa from 'papaparse';

const AdminDashboard = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('players');
  const [message, setMessage] = useState('');

  // Sample data structure for players
  const playerFields = [
    'name', 'playerId', 'war', 'fwar', 'bwar', 'wrcPlus', 'salary'
  ];

  // Sample data structure for teams
  const teamFields = [
    'teamName', 'totalPayroll', 'activePayroll', 'teamWar'
  ];

  useEffect(() => {
    // Load data from localStorage on component mount
    loadData();
  }, []);

  const loadData = () => {
    const savedPlayers = localStorage.getItem('adminPlayers');
    const savedTeams = localStorage.getItem('adminTeams');
    
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  };

  const saveData = () => {
    localStorage.setItem('adminPlayers', JSON.stringify(players));
    localStorage.setItem('adminTeams', JSON.stringify(teams));
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  // Player Management Functions
  const handlePlayerFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validPlayers = results.data.filter(player => 
          player.name && player.playerId
        ).map(player => ({
          name: player.name || '',
          playerId: player.playerId || '',
          war: parseFloat(player.war) || 0,
          fwar: parseFloat(player.fwar) || 0,
          bwar: parseFloat(player.bwar) || 0,
          wrcPlus: parseFloat(player.wrcPlus) || 0,
          salary: parseFloat(player.salary) || 0
        }));

        setPlayers(validPlayers);
        saveData();
        showMessage(`Imported ${validPlayers.length} players successfully`);
      },
      error: (error) => {
        showMessage('Error parsing CSV file', 'error');
        console.error('CSV parsing error:', error);
      }
    });
  };

  const exportPlayers = () => {
    const csv = Papa.unparse(players);
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

  const addPlayer = () => {
    const newPlayer = {
      name: '',
      playerId: '',
      war: 0,
      fwar: 0,
      bwar: 0,
      wrcPlus: 0,
      salary: 0
    };
    setPlayers([...players, newPlayer]);
  };

  const updatePlayer = (index, field, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    setPlayers(updatedPlayers);
    saveData();
  };

  const deletePlayer = (index) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
    saveData();
    showMessage('Player deleted successfully');
  };

  // Team Management Functions
  const handleTeamFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validTeams = results.data.filter(team => 
          team.teamName
        ).map(team => ({
          teamName: team.teamName || '',
          totalPayroll: parseFloat(team.totalPayroll) || 0,
          activePayroll: parseFloat(team.activePayroll) || 0,
          teamWar: parseFloat(team.teamWar) || 0
        }));

        setTeams(validTeams);
        saveData();
        showMessage(`Imported ${validTeams.length} teams successfully`);
      },
      error: (error) => {
        showMessage('Error parsing CSV file', 'error');
        console.error('CSV parsing error:', error);
      }
    });
  };

  const exportTeams = () => {
    const csv = Papa.unparse(teams);
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

  const addTeam = () => {
    const newTeam = {
      teamName: '',
      totalPayroll: 0,
      activePayroll: 0,
      teamWar: 0
    };
    setTeams([...teams, newTeam]);
  };

  const updateTeam = (index, field, value) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = { ...updatedTeams[index], [field]: value };
    setTeams(updatedTeams);
    saveData();
  };

  const deleteTeam = (index) => {
    const updatedTeams = teams.filter((_, i) => i !== index);
    setTeams(updatedTeams);
    saveData();
    showMessage('Team deleted successfully');
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setPlayers([]);
      setTeams([]);
      localStorage.removeItem('adminPlayers');
      localStorage.removeItem('adminTeams');
      showMessage('All data cleared successfully');
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
          </div>
          <p className="text-gray-400 text-base md:text-lg px-4">
            Manage player and team data for WAR Value Calculator
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'error' ? 'bg-red-900 text-red-100' : 'bg-green-900 text-green-100'
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Player ID</th>
                    <th className="text-left p-2">WAR</th>
                    <th className="text-left p-2">fWAR</th>
                    <th className="text-left p-2">bWAR</th>
                    <th className="text-left p-2">wRC+</th>
                    <th className="text-left p-2">Salary ($M)</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-2">
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={player.playerId}
                          onChange={(e) => updatePlayer(index, 'playerId', e.target.value)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={player.war}
                          onChange={(e) => updatePlayer(index, 'war', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={player.fwar}
                          onChange={(e) => updatePlayer(index, 'fwar', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={player.bwar}
                          onChange={(e) => updatePlayer(index, 'bwar', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={player.wrcPlus}
                          onChange={(e) => updatePlayer(index, 'wrcPlus', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={player.salary}
                          onChange={(e) => updatePlayer(index, 'salary', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                        />
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => deletePlayer(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">Team Name</th>
                    <th className="text-left p-2">Total Payroll ($M)</th>
                    <th className="text-left p-2">Active Payroll ($M)</th>
                    <th className="text-left p-2">Team WAR</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-2">
                        <input
                          type="text"
                          value={team.teamName}
                          onChange={(e) => updateTeam(index, 'teamName', e.target.value)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={team.totalPayroll}
                          onChange={(e) => updateTeam(index, 'totalPayroll', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-32"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={team.activePayroll}
                          onChange={(e) => updateTeam(index, 'activePayroll', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-32"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={team.teamWar}
                          onChange={(e) => updateTeam(index, 'teamWar', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                        />
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => deleteTeam(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data Management */}
        <div className="mt-6 text-center">
          <button
            onClick={clearAllData}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition-colors"
          >
            Clear All Data
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Data is stored locally in your browser</p>
          <p className="mt-1">Export your data regularly to avoid loss</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 