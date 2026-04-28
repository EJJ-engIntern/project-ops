import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';
import { UserRecord, Role } from '../types';

export default function Users() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Developer' as Role, target_hours: 40 });

  const load = () => api.get<UserRecord[]>('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/auth/register', form);
    setForm({ name: '', email: '', password: '', role: 'Developer', target_hours: 40 });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Users</h2>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}>
          <option>Admin</option><option>PM</option><option>Developer</option>
        </select>
        <input type="number" value={form.target_hours}
          onChange={e => setForm({ ...form, target_hours: Number(e.target.value) })} style={{ width: 100 }} />
        <button type="submit">Add user</button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '8px 0' }}>Name</th><th>Email</th><th>Role</th><th>Target hrs</th><th></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '10px 0' }}>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.target_hours}</td>
              <td><button onClick={() => handleDelete(u.id)} style={{ fontSize: 12 }}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}