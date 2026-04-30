import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Milestone, Project } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const statusBadge = (s: string) =>
  s === 'Completed' ? 'green' : s === 'In Progress' ? 'blue' : 'gray';

function isOverdue(due: string, status: string) {
  return status !== 'Completed' && new Date(due) < new Date();
}

function isDueSoon(due: string, status: string) {
  const diff = (new Date(due).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return status !== 'Completed' && diff >= 0 && diff <= 7;
}

export default function Milestones() {
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'PM';

  const [milestones, setMilestones]       = useState<Milestone[]>([]);
  const [projects, setProjects]           = useState<Project[]>([]);
  const [open, setOpen]                   = useState(false);
  const [filterProject, setFilterProject] = useState('');
  const [form, setForm] = useState({ project_id: '', title: '', due_date: '' });

  const load = () => api.get<Milestone[]>('/milestones').then(r => setMilestones(r.data));
  useEffect(() => {
    load();
    api.get<Project[]>('/projects').then(r => setProjects(r.data));
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/milestones', form);
    setForm({ project_id: '', title: '', due_date: '' });
    setOpen(false);
    load();
  };

  const updateStatus = async (id: number, status: string) => {
    await api.patch(`/milestones/${id}`, { status });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this milestone?')) return;
    await api.delete(`/milestones/${id}`);
    load();
  };

  const filtered = filterProject
    ? milestones.filter(m => String(m.project_id) === filterProject)
    : milestones;

  const projectProgress = projects.map(p => {
    const pm   = milestones.filter(m => m.project_id === p.id);
    const done = pm.filter(m => m.status === 'Completed').length;
    const pct  = pm.length ? Math.round((done / pm.length) * 100) : 0;
    return { ...p, total: pm.length, done, pct };
  }).filter(p => p.total > 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
        {canManage && (
          <button onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            + New Milestone
          </button>
        )}
      </div>

      {/* Progress bars */}
      {projectProgress.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Project milestone progress
          </p>
          <div className="flex flex-col gap-3">
            {projectProgress.map(p => (
              <div key={p.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{p.name}</span>
                  <span className="text-gray-400">{p.done}/{p.total} · {p.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      p.pct === 100 ? 'bg-green-500' : p.pct > 50 ? 'bg-blue-500' : 'bg-yellow-400'
                    }`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Milestone', 'Project', 'Due Date', 'Status', ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{m.title}</td>
                <td className="px-4 py-3 text-gray-600">{m.project_name}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${
                    isOverdue(m.due_date, m.status) ? 'text-red-600' :
                    isDueSoon(m.due_date, m.status) ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {m.due_date?.split('T')[0]}
                    {isOverdue(m.due_date, m.status) && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Overdue</span>
                    )}
                    {isDueSoon(m.due_date, m.status) && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Due soon</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {canManage ? (
                    <select value={m.status} onChange={e => updateStatus(m.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  ) : (
                    <Badge label={m.status} color={statusBadge(m.status) as any} />
                  )}
                </td>
                <td className="px-4 py-3">
                  {canManage && (
                    <button onClick={() => handleDelete(m.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No milestones yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Milestone">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} required>
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required />
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