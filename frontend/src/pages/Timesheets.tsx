import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';
import { Timesheet, Task } from '../types';

export default function Timesheets() {
  const [entries, setEntries] = useState<Timesheet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({ task_id: '', log_date: '', hours_logged: '' });

  const load = () => api.get<Timesheet[]>('/timesheets').then(r => setEntries(r.data));
  useEffect(() => {
    load();
    api.get<Task[]>('/tasks').then(r => setTasks(r.data));
  }, []);

  const handleLog = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/timesheets', form);
    setForm({ task_id: '', log_date: '', hours_logged: '' });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Timesheets</h2>
      <form onSubmit={handleLog} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={form.task_id} onChange={e => setForm({ ...form, task_id: e.target.value })} required>
          <option value="">Select task</option>
          {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <input type="date" value={form.log_date}
          onChange={e => setForm({ ...form, log_date: e.target.value })} required />
        <input type="number" step="0.5" placeholder="Hours" value={form.hours_logged}
          onChange={e => setForm({ ...form, hours_logged: e.target.value })} style={{ width: 90 }} required />
        <button type="submit">Log hours</button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '8px 0' }}>Task</th><th>Member</th><th>Date</th><th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '10px 0' }}>{e.task_title}</td>
              <td>{e.user_name}</td>
              <td>{e.log_date?.split('T')[0]}</td>
              <td>{e.hours_logged}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}