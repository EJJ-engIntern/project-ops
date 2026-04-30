import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface Summary {
  activeProjects: number;
  openTasks: number;
  hoursThisWeek: number;
  pendingApprovals: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Summary>('/projects/summary')
      .then(r => setSummary(r.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = summary ? [
    { label: 'Active Projects',   value: summary.activeProjects,   color: 'bg-blue-50 border-blue-200' },
    { label: 'Open Tasks',        value: summary.openTasks,        color: 'bg-yellow-50 border-yellow-200' },
    { label: 'Hours This Week',   value: summary.hoursThisWeek,    color: 'bg-green-50 border-green-200' },
    { label: 'Pending Approvals', value: summary.pendingApprovals, color: 'bg-red-50 border-red-200' },
  ] : [];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Dashboard</h2>
      <p className="text-sm text-gray-500 mb-6">Welcome back, {user?.name} · {user?.role}</p>

      {loading ? (
        <div className="flex justify-center mt-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <div key={c.label} className={`border rounded-xl p-5 ${c.color}`}>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">{c.label}</p>
              <p className="text-4xl font-bold text-gray-800">{c.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}