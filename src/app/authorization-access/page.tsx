'use client';

import { useState, useEffect } from 'react';
import CustomDropdown from '@/components/CustomDropdown';

export default function AuthorizationAccessPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VERIFIER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [isCustomRole, setIsCustomRole] = useState(false);
  const [availableRoles, setAvailableRoles] = useState(['ADMIN', 'VERIFIER', 'DEVELOPER', 'SUPERADMIN']);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to add user');
      } else {
        setName('');
        setEmail('');
        setPassword('');
        setRole(availableRoles[0]);
        fetchUsers();
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem' }}>Authorization Access</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Add User Form */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '24px', color: 'var(--primary)' }}>Add New User</h3>
          
          {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Name</label>
              <input 
                type="text" 
                required 
                className="input-field" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="label">Email ID</label>
              <input 
                type="email" 
                required 
                className="input-field" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="john@dfurn.in"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input 
                type="password" 
                required 
                className="input-field" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="label">Role</label>
              {!isCustomRole ? (
                <CustomDropdown
                  value={role}
                  onChange={(val) => {
                    if (val === '+ADD_ROLE') {
                      setIsCustomRole(true);
                      setRole('');
                    } else {
                      setRole(val);
                    }
                  }}
                  options={[
                    ...availableRoles.map(r => ({ label: r, value: r })),
                    { label: '+ Add Role', value: '+ADD_ROLE', isSpecial: true }
                  ]}
                />
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={role} 
                    onChange={e => setRole(e.target.value.toUpperCase())}
                    placeholder="ENTER NEW ROLE"
                    style={{ flex: 1 }}
                    autoFocus
                    required={isCustomRole}
                  />
                  <button 
                    type="button" 
                    onClick={() => { 
                      const newRole = role.trim();
                      if (newRole && !availableRoles.includes(newRole)) {
                        setAvailableRoles([...availableRoles, newRole]);
                      }
                      setIsCustomRole(false); 
                      if (!newRole) setRole(availableRoles[0]);
                    }}
                    className="btn-primary" 
                    style={{ padding: '0 16px', whiteSpace: 'nowrap', borderRadius: '8px', fontSize: '0.9rem' }}
                  >
                    Save
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsCustomRole(false); setRole(availableRoles[0]); }}
                    className="btn-secondary" 
                    style={{ padding: '0 16px', whiteSpace: 'nowrap', borderRadius: '8px', fontSize: '0.9rem', color: '#ef4444' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '24px', color: 'var(--primary)' }}>System Users</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Added On</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', opacity: 0.5 }}>No users found</td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '12px' }}>{u.name}</td>
                      <td style={{ padding: '12px', opacity: 0.8 }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem', 
                          fontWeight: 600,
                          backgroundColor: u.role === 'SUPERADMIN' ? '#fee2e2' : u.role === 'ADMIN' ? '#e0e7ff' : '#dcfce3',
                          color: u.role === 'SUPERADMIN' ? '#991b1b' : u.role === 'ADMIN' ? '#3730a3' : '#166534'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px', opacity: 0.7, fontSize: '0.9rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
