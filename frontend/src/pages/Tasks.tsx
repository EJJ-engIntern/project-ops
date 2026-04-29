import { useEffect, useState, FormEvent } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Task, Project, UserRecord } from '../types';

const statusColor = (s: string) =>
  s === 'Done' ? 'success' : s === 'In Progress' ? 'primary' : 'default';

export default function Tasks() {
  const { user }  = useAuth();
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers]       = useState<UserRecord[]>([]);
  const [open, setOpen]         = useState(false);
  const [form, setForm] = useState({
    project_id: '', assignee_id: '', title: '', estimated_hours: ''
  });
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
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>Tasks</Typography>
        {canCreate && (
          <Button variant="contained" size="small" onClick={() => setOpen(true)}>+ New Task</Button>
        )}
      </Box>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Est. hrs</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map(t => (
              <TableRow key={t.id} hover>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.project_name}</TableCell>
                <TableCell>{t.assignee_name}</TableCell>
                <TableCell>{t.estimated_hours}</TableCell>
                <TableCell>
                  {canCreate || t.assignee_id === user?.id ? (
                    <Select size="small" value={t.status}
                      onChange={e => updateStatus(t.id, e.target.value)}
                      sx={{ fontSize: 13 }}>
                      <MenuItem value="Todo">Todo</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Done">Done</MenuItem>
                    </Select>
                  ) : (
                    <Chip label={t.status} size="small" color={statusColor(t.status) as any} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  No tasks yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Task</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel>Project</InputLabel>
              <Select label="Project" value={form.project_id}
                onChange={e => setForm({ ...form, project_id: e.target.value })}>
                {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth required>
              <InputLabel>Assignee</InputLabel>
              <Select label="Assignee" value={form.assignee_id}
                onChange={e => setForm({ ...form, assignee_id: e.target.value })}>
                {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Task title" size="small" fullWidth required
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <TextField label="Estimated hours" type="number" size="small" fullWidth
              value={form.estimated_hours}
              onChange={e => setForm({ ...form, estimated_hours: e.target.value })} />
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