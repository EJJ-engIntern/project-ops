import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Task, Project, UserRecord } from '../types';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [form, setForm] = useState({ project_id: '', assignee_id: '', title: '', estimated_hours: '' });
  const canCreate = user?.role === 'Admin' || user?.role === 'PM';

  const load = () => api.get<Task[]>('/tasks').then(r => setTasks(r.data));
  useEffect(() => {
    load();
    api.get<Project[]>('/projects').then(r => setProjects(r.data));
    if (canCreate) api.get<UserRecord[]>('/users').then(r => setUsers(r.data));
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/tasks', form);
    setForm({ project_id: '', assignee_id: '', title: '', estimated_hours: '' });
    load();
  };

  const updateStatus = async (id: number, status: string) => {
    await api.patch(`/tasks/${id}`, { status });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Tasks</h2>
      {canCreate && (
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} required>
            <option value="">Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={form.assignee_id} onChange={e => setForm({ ...form, assignee_id: e.target.value })} required>
            <option value="">Assignee</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input placeholder="Task title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input type="number" placeholder="Est. hours" value={form.estimated_hours}
            onChange={e => setForm({ ...form, estimated_hours: e.target.value })} style={{ width: 100 }} />
          <button type="submit">Add task</button>
        </form>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '8px 0' }}>Title</th>
            <th>Project</th><th>Assignee</th><th>Est. hrs</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '10px 0' }}>{t.title}</td>
              <td>{t.project_name}</td>
              <td>{t.assignee_name}</td>
              <td>{t.estimated_hours}</td>
              <td>
                <select value={t.status}
                  onChange={e => updateStatus(t.id, e.target.value)}
                  disabled={user?.role === 'Developer' && t.assignee_id !== user.id}>
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}