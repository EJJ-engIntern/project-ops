import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, Tabs, Tab
} from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Timesheets from './pages/Timesheets';
import Users from './pages/Users';

const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Projects',  path: '/projects',  roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Tasks',     path: '/tasks',     roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Timesheets',path: '/timesheets',roles: ['Admin', 'PM', 'Developer'] },
  { label: 'Users',     path: '/users',     roles: ['Admin'] },
];

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null;

  const visible = NAV_LINKS.filter(l => l.roles.includes(user.role));
  const current = visible.findIndex(l => location.pathname === l.path);

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar variant="dense" sx={{ gap: 2 }}>
        <Typography fontWeight={600} sx={{ mr: 2 }}>ProjectOps</Typography>
        <Tabs
          value={current === -1 ? false : current}
          textColor="inherit"
          TabIndicatorProps={{ style: { background: '#fff' } }}
          sx={{ flexGrow: 1 }}
        >
          {visible.map((l, i) => (
            <Tab key={l.path} label={l.label} onClick={() => navigate(l.path)}
              sx={{ fontSize: 13, minHeight: 48 }} />
          ))}
        </Tabs>
        <Typography fontSize={13} sx={{ mr: 1 }}>{user.name} · {user.role}</Typography>
        <Button color="inherit" size="small" onClick={logout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects"  element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/tasks"     element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/timesheets"element={<ProtectedRoute><Timesheets /></ProtectedRoute>} />
          <Route path="/users"     element={<ProtectedRoute roles={['Admin']}><Users /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}