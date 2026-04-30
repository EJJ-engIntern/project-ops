import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Task, Project, UserRecord } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const statusBadge = (s: string) =>
  s === 'Done' ? 'green' : s === 'In Progress' ? 'blue' : 'gray';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers]       = useState<UserRecord[]>([]);
  const [open, setOpen]         = useState(false);
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
    setOpen(false);
    load();
  };

  const updateStatus = async (id: number, status: string) => {
    await api.patch(`/tasks/${id}`, { status });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
        {canCreate && (
          <button onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            + New Task
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title', 'Project', 'Assignee', 'Est. hrs', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                <td className="px-4 py-3 text-gray-600">{t.project_name}</td>
                <td className="px-4 py-3 text-gray-600">{t.assignee_name}</td>
                <td className="px-4 py-3 text-gray-600">{t.estimated_hours}</td>
                <td className="px-4 py-3">
                  {canCreate || t.assignee_id === user?.id ? (
                    <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Todo</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  ) : (
                    <Badge label={t.status} color={statusBadge(t.status) as any} />
                  )}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No tasks yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Task">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.assignee_id} onChange={e => setForm({ ...form, assignee_id: e.target.value })} required>
              <option value="">Select assignee</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated hours</label>
            <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: e.target.value })} />
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