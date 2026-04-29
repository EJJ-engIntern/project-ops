import { useEffect, useState, FormEvent } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';

const healthColor = (h: string) =>
  h === 'Good' ? 'success' : h === 'At Risk' ? 'warning' : 'error';

const statusColor = (s: string) =>
  s === 'Active' ? 'primary' : s === 'Completed' ? 'success' : 'default';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState({ name: '', start_date: '' });
  const canCreate = user?.role === 'Admin' || user?.role === 'PM';

  const load = () => api.get<Project[]>('/projects').then(r => setProjects(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/projects', form);
    setForm({ name: '', start_date: '' });
    setOpen(false);
    load();
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>Projects</Typography>
        {canCreate && (
          <Button variant="contained" size="small" onClick={() => setOpen(true)}>
            + New Project
          </Button>
        )}
      </Box>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Health</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>PM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <Chip label={p.status} size="small" color={statusColor(p.status) as any} />
                </TableCell>
                <TableCell>
                  <Chip label={p.health} size="small" color={healthColor(p.health) as any} />
                </TableCell>
                <TableCell>{p.start_date?.split('T')[0]}</TableCell>
                <TableCell>{p.pm_name ?? '—'}</TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  No projects yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Project</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Project name" size="small" fullWidth required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Start date" type="date" size="small" fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
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