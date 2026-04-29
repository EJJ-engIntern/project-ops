import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField,
  Button, Typography, Alert
} from '@mui/material';
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
    login(res.data.token, res.data.user);
    navigate('/dashboard');
  } catch (err: any) {
    console.log('Full error:', err);
    console.log('Response:', err?.response);
    console.log('Message:', err?.message);
    setError(err?.response?.data?.message ?? err?.message ?? 'Login failed');
  }
};

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Card sx={{ width: 360, p: 1 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={3}>ProjectOps</Typography>
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField label="Email" type="email" size="small" fullWidth
              value={email} onChange={e => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" size="small" fullWidth
              value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" fullWidth>Sign in</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}