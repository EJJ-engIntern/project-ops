import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';
import { Timesheet, Task } from '../types';
import Modal from '../components/Modal';

export default function Timesheets() {
  const [entries, setEntries] = useState<Timesheet[]>([]);
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState({ task_id: '', log_date: '', hours_logged: '' });

  const load = () => api.get<Timesheet[]>('/timesheets').then(r => setEntries(r.data));
  useEffect(() => {
    load();
    api.get<Task[]>('/tasks').then(r => setTasks(r.data));
  }, []);

  const handleLog = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/timesheets', form);
    setForm({ task_id: '', log_date: '', hours_logged: '' });
    setOpen(false);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Timesheets</h2>
        <button onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          + Log Hours
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Task', 'Member', 'Date', 'Hours'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{e.task_title}</td>
                <td className="px-4 py-3 text-gray-600">{e.user_name}</td>
                <td className="px-4 py-3 text-gray-600">{e.log_date?.split('T')[0]}</td>
                <td className="px-4 py-3 text-gray-600">{e.hours_logged}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Hours">
        <form onSubmit={handleLog} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.task_id} onChange={e => setForm({ ...form, task_id: e.target.value })} required>
              <option value="">Select task</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.log_date} onChange={e => setForm({ ...form, log_date: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
            <input type="number" step="0.5" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.hours_logged} onChange={e => setForm({ ...form, hours_logged: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Log</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}