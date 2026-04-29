import { useEffect, useState, FormEvent } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import api from '../api/axios';
import { Timesheet, Task } from '../types';

export default function Timesheets() {
  const [entries, setEntries] = useState<Timesheet[]>([]);
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState({ task_id: '', log_date: '', hours_logged: '' });

  const load = () => api.get<Timesheet[]>('/timesheets').then(r => setEntries(r.data));
  useEffect(() => {
    load();
    api.get<Task[]>('/tasks').then(r => setTasks(r.data));
  }, []);

  const handleLog = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/timesheets', form);
    setForm({ task_id: '', log_date: '', hours_logged: '' });
    setOpen(false);
    load();
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>Timesheets</Typography>
        <Button variant="contained" size="small" onClick={() => setOpen(true)}>+ Log Hours</Button>
      </Box>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(e => (
              <TableRow key={e.id} hover>
                <TableCell>{e.task_title}</TableCell>
                <TableCell>{e.user_name}</TableCell>
                <TableCell>{e.log_date?.split('T')[0]}</TableCell>
                <TableCell>{e.hours_logged}</TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  No entries yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Log Hours</DialogTitle>
        <Box component="form" onSubmit={handleLog}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel>Task</InputLabel>
              <Select label="Task" value={form.task_id}
                onChange={e => setForm({ ...form, task_id: e.target.value })}>
                {tasks.map(t => <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Date" type="date" size="small" fullWidth required
              InputLabelProps={{ shrink: true }}
              value={form.log_date} onChange={e => setForm({ ...form, log_date: e.target.value })} />
            <TextField label="Hours" type="number" size="small" fullWidth required
              inputProps={{ step: 0.5 }}
              value={form.hours_logged} onChange={e => setForm({ ...form, hours_logged: e.target.value })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Log</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}