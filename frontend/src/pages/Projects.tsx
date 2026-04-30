import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const healthBadge = (h: string) =>
  h === 'Good' ? 'green' : h === 'At Risk' ? 'yellow' : 'red';

const statusBadge = (s: string) =>
  s === 'Active' ? 'blue' : s === 'Completed' ? 'green' : 'gray';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState({ name: '', start_date: '' });
  const canCreate = user?.role === 'Admin' || user?.role === 'PM';

  const load = () => api.get<Project[]>('/projects').then(r => setProjects(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/projects', form);
    setForm({ name: '', start_date: '' });
    setOpen(false);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        {canCreate && (
          <button onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            + New Project
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Status', 'Health', 'Start Date', 'PM'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3"><Badge label={p.status} color={statusBadge(p.status) as any} /></td>
                <td className="px-4 py-3"><Badge label={p.health} color={healthBadge(p.health) as any} /></td>
                <td className="px-4 py-3 text-gray-600">{p.start_date?.split('T')[0]}</td>
                <td className="px-4 py-3 text-gray-600">{p.pm_name ?? '—'}</td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No projects yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Project">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project name</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}