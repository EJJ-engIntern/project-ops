import { useEffect, useState, FormEvent } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import api from '../api/axios';
import { UserRecord, Role } from '../types';

export default function Users() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState({
    name: '', email: '', password: '', role: 'Developer' as Role, target_hours: 40
  });

  const load = () => api.get<UserRecord[]>('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/auth/register', form);
    setForm({ name: '', email: '', password: '', role: 'Developer', target_hours: 40 });
    setOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>Users</Typography>
        <Button variant="contained" size="small" onClick={() => setOpen(true)}>+ New User</Button>
      </Box>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Target hrs</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} hover>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip label={u.role} size="small"
                    color={u.role === 'Admin' ? 'error' : u.role === 'PM' ? 'warning' : 'default'} />
                </TableCell>
                <TableCell>{u.target_hours}</TableCell>
                <TableCell>
                  <Button size="small" color="error" onClick={() => handleDelete(u.id)}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New User</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Name" size="small" fullWidth required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Email" type="email" size="small" fullWidth required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <TextField label="Password" type="password" size="small" fullWidth required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value as Role })}>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="PM">PM</MenuItem>
                <MenuItem value="Developer">Developer</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Target hours / week" type="number" size="small" fullWidth
              value={form.target_hours}
              onChange={e => setForm({ ...form, target_hours: Number(e.target.value) })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}