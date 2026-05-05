import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { AuthUser } from '../types';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError('');
  try {
    const res = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
    console.log('Login response:', res.data);
    login(res.data.token, res.data.user);
    console.log('Token stored:', localStorage.getItem('token'));
    console.log('User stored:', localStorage.getItem('user'));
    console.log('Navigating to dashboard...');
    navigate('/dashboard');
  } catch (err: any) {
    console.log('Error:', err?.response?.data ?? err?.message);
    setError(err?.response?.data?.message ?? 'Login failed');
  }
};
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">ProjectOps</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}