import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { token, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = roleFilter 
        ? `${API_BASE_URL}/admin/users?role=${roleFilter}`
        : `${API_BASE_URL}/admin/users`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token, roleFilter]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate, fetchUsers]);

  const handleAssignRecruiter = async (userId) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/assign-recruiter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to assign recruiter role');
      }

      setSuccess('Recruiter role assigned successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRevokeRecruiter = async (userId) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/revoke-recruiter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to revoke recruiter role');
      }

      setSuccess('Recruiter role revoked successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete user');
      }

      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'recruiter':
        return 'role-badge recruiter';
      default:
        return 'role-badge candidate';
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>👤 Admin Panel</h1>
        <p>Manage users and assign recruiter roles</p>
      </div>

      <div className="admin-content">
        <div className="admin-toolbar">
          <div className="filter-group">
            <label htmlFor="roleFilter">Filter by role:</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="recruiter">Recruiters</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <button className="refresh-btn" onClick={fetchUsers}>
            🔄 Refresh
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(u.role)}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={u.is_active ? 'status-active' : 'status-inactive'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {u.role === 'candidate' && (
                        <button
                          className="action-btn assign"
                          onClick={() => handleAssignRecruiter(u.id)}
                        >
                          Assign Recruiter
                        </button>
                      )}
                      {u.role === 'recruiter' && (
                        <button
                          className="action-btn revoke"
                          onClick={() => handleRevokeRecruiter(u.id)}
                        >
                          Revoke Recruiter
                        </button>
                      )}
                      {u.id !== user?.id && u.role !== 'admin' && (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="no-users">No users found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
