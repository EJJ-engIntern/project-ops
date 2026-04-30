import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Timesheets from './pages/Timesheets';
import Users from './pages/Users';
import Resources from './pages/Resources';
import Milestones from './pages/Milestones';

const NAV_LINKS = [
  { label: 'Dashboard',  path: '/dashboard',  roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Projects',   path: '/projects',   roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Tasks',      path: '/tasks',      roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Milestones', path: '/milestones', roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Timesheets', path: '/timesheets', roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Resources',  path: '/resources',  roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Users',      path: '/users',      roles: ['Admin'] },
];

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null;

  const visible = NAV_LINKS.filter(l => l.roles.includes(user.role));

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="flex items-center px-6 h-12 gap-6">
        <span className="font-bold text-base tracking-tight mr-4">ProjectOps</span>
        <div className="flex items-center gap-1 flex-1">
          {visible.map(l => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                location.pathname === l.path
                  ? 'bg-white text-gray-900 font-medium'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-400">{user.name} · {user.role}</span>
        <button
          onClick={logout}
          className="text-sm text-gray-300 hover:text-white border border-gray-600 px-3 py-1 rounded hover:bg-gray-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/login"      element={<Login />} />
          <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects"   element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/tasks"      element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/milestones" element={<ProtectedRoute><Milestones /></ProtectedRoute>} />
          <Route path="/timesheets" element={<ProtectedRoute><Timesheets /></ProtectedRoute>} />
          <Route path="/resources"  element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="/users"      element={<ProtectedRoute roles={['Admin']}><Users /></ProtectedRoute>} />
          <Route path="*"           element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}