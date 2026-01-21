import React, { useState, useEffect } from 'react';
import { authService } from '../lib/authService';

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const data = await authService.getUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await authService.approveUser(id);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Approval failed');
        }
    };

    const handleRoleChange = async (id: string, role: string) => {
        try {
            await authService.updateRole(id, role);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Role update failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await authService.deleteUser(id);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Deletion failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <h2 style={{ marginBottom: '2rem' }}>User Management</h2>
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</div>}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Username</th>
                            <th style={{ padding: '1rem' }}>Role</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Created At</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem' }}>{user.username}</td>
                                <td style={{ padding: '1rem' }}>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="input"
                                        style={{ padding: '0.25rem', width: 'auto' }}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {user.is_approved ? (
                                        <span style={{ color: 'var(--success-color)' }}>Approved</span>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)' }}>Pending</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {!user.is_approved && (
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="btn"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', background: 'var(--success-color)' }}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="btn"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', background: 'var(--error-color)' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementPage;
