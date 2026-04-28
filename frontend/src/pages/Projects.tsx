import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ name: '', start_date: '' });
  const canCreate = user?.role === 'Admin' || user?.role === 'PM';

  const load = () => api.get<Project[]>('/projects').then(r => setProjects(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/projects', form);
    setForm({ name: '', start_date: '' });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Projects</h2>
      {canCreate && (
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <input placeholder="Project name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input type="date" value={form.start_date}
            onChange={e => setForm({ ...form, start_date: e.target.value })} />
          <button type="submit">Add project</button>
        </form>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '8px 0' }}>Name</th>
            <th>Status</th><th>Health</th><th>Start date</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '10px 0' }}>{p.name}</td>
              <td>{p.status}</td>
              <td>{p.health}</td>
              <td>{p.start_date?.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}