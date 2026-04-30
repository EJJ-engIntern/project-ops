import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Resource, Project, ProjectResource } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const typeBadge = (t: string) =>
  t === 'Software' ? 'blue' : t === 'Hardware' ? 'yellow' : 'green';

export default function Resources() {
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'PM';
  const isAdmin   = user?.role === 'Admin';

  const [tab, setTab]                         = useState<'all' | 'allocated'>('all');
  const [resources, setResources]             = useState<Resource[]>([]);
  const [projects, setProjects]               = useState<Project[]>([]);
  const [allocated, setAllocated]             = useState<ProjectResource[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [openResource, setOpenResource]       = useState(false);
  const [openAllocate, setOpenAllocate]       = useState(false);
  const [confirmDelete, setConfirmDelete]     = useState<{ type: 'single' | 'all'; id?: number } | null>(null);
  const [resourceForm, setResourceForm]       = useState({ name: '', type: 'Software', description: '' });
  const [allocateForm, setAllocateForm]       = useState({ project_id: '', resource_id: '', notes: '' });

  const loadResources = () => api.get<Resource[]>('/resources').then(r => setResources(r.data));
  const loadAllocated = (pid: string) => {
    if (!pid) return;
    api.get<ProjectResource[]>(`/resources/project/${pid}`).then(r => setAllocated(r.data));
  };

  useEffect(() => {
    loadResources();
    api.get<Project[]>('/projects').then(r => setProjects(r.data));
  }, []);

  useEffect(() => { loadAllocated(selectedProject); }, [selectedProject]);

  // Seed dummy resources if empty
  useEffect(() => {
    if (resources.length === 0) {
      const seeds = [
        { name: 'GitHub Enterprise', type: 'Software', description: 'Version control & CI/CD' },
        { name: 'Jira Software',     type: 'Software', description: 'Project & issue tracking' },
        { name: 'Figma',             type: 'Software', description: 'UI/UX design tool' },
        { name: 'VS Code',           type: 'Software', description: 'Code editor' },
        { name: 'MacBook Pro 16"',   type: 'Hardware', description: 'Developer laptop' },
        { name: 'Dell Monitor 27"',  type: 'Hardware', description: 'External display' },
        { name: 'Logitech MX Keys',  type: 'Hardware', description: 'Wireless keyboard' },
        { name: 'Standing Desk',     type: 'Hardware', description: 'Adjustable standing desk' },
      ];
      Promise.all(seeds.map(s => api.post('/resources', s))).then(() => loadResources());
    }
  }, [resources.length]);

  const handleCreateResource = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/resources', resourceForm);
    setResourceForm({ name: '', type: 'Software', description: '' });
    setOpenResource(false);
    loadResources();
  };

  const handleAllocate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/resources/allocate', allocateForm);
    setAllocateForm({ project_id: '', resource_id: '', notes: '' });
    setOpenAllocate(false);
    if (selectedProject) loadAllocated(selectedProject);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'single' && confirmDelete.id) {
      await api.delete(`/resources/${confirmDelete.id}`);
    } else if (confirmDelete.type === 'all') {
      await api.delete('/resources');
    }
    setConfirmDelete(null);
    loadResources();
    if (selectedProject) loadAllocated(selectedProject);
  };

  const handleRemoveAllocation = async (id: number) => {
    await api.delete(`/resources/allocate/${id}`);
    loadAllocated(selectedProject);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
        <div className="flex gap-2">
          {isAdmin && tab === 'all' && resources.length > 0 && (
            <button
              onClick={() => setConfirmDelete({ type: 'all' })}
              className="border border-red-400 text-red-500 hover:bg-red-50 text-sm px-4 py-2 rounded-lg transition-colors">
              Delete All
            </button>
          )}
          {canManage && (
            <>
              <button onClick={() => setOpenAllocate(true)}
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm px-4 py-2 rounded-lg transition-colors">
                Allocate to Project
              </button>
              <button onClick={() => setOpenResource(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                + New Resource
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {(['all', 'allocated'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'all' ? `All Resources (${resources.length})` : 'Allocated by Project'}
          </button>
        ))}
      </div>

      {/* All Resources Tab */}
      {tab === 'all' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Type', 'Description', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3"><Badge label={r.type} color={typeBadge(r.type) as any} /></td>
                  <td className="px-4 py-3 text-gray-600">{r.description}</td>
                  <td className="px-4 py-3">
                    {isAdmin && (
                      <button
                        onClick={() => setConfirmDelete({ type: 'single', id: r.id })}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">No resources yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Allocated by Project Tab */}
      {tab === 'allocated' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
              value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
              <option value="">Choose a project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Resource', 'Type', 'Notes', 'Allocated On', ''].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allocated.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-3"><Badge label={a.type} color={typeBadge(a.type) as any} /></td>
                    <td className="px-4 py-3 text-gray-600">{a.notes || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.allocated_on?.split('T')[0]}</td>
                    <td className="px-4 py-3">
                      {canManage && (
                        <button onClick={() => handleRemoveAllocation(a.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {allocated.length === 0 && selectedProject && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No resources allocated to this project.</td></tr>
                )}
                {!selectedProject && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">Select a project to view allocations.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={confirmDelete?.type === 'all' ? 'Delete All Resources' : 'Delete Resource'}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">
            {confirmDelete?.type === 'all'
              ? `This will permanently delete all ${resources.length} resources and remove all their project allocations. This cannot be undone.`
              : 'This will permanently delete this resource and remove all its project allocations. This cannot be undone.'}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleConfirmDelete}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
              {confirmDelete?.type === 'all' ? 'Delete All' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* New Resource Modal */}
      <Modal open={openResource} onClose={() => setOpenResource(false)} title="New Resource">
        <form onSubmit={handleCreateResource} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={resourceForm.name} onChange={e => setResourceForm({ ...resourceForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={resourceForm.type} onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })}>
              <option>Software</option>
              <option>Hardware</option>
              <option>Human</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpenResource(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
          </div>
        </form>
      </Modal>

      {/* Allocate Resource Modal */}
      <Modal open={openAllocate} onClose={() => setOpenAllocate(false)} title="Allocate Resource to Project">
        <form onSubmit={handleAllocate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={allocateForm.project_id} onChange={e => setAllocateForm({ ...allocateForm, project_id: e.target.value })} required>
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={allocateForm.resource_id} onChange={e => setAllocateForm({ ...allocateForm, resource_id: e.target.value })} required>
              <option value="">Select resource</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={allocateForm.notes} onChange={e => setAllocateForm({ ...allocateForm, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpenAllocate(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Allocate</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}