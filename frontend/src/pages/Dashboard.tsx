import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13 }}>{user?.name} · {user?.role}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
      <p style={{ color: '#666', fontSize: 14 }}>Welcome back, {user?.name}.</p>
    </div>
  );
}