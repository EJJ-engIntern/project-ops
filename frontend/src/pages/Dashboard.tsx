import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
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

  const cards = summary
    ? [
        { label: 'Active Projects',    value: summary.activeProjects },
        { label: 'Open Tasks',         value: summary.openTasks },
        { label: 'Hours This Week',    value: summary.hoursThisWeek },
        { label: 'Pending Approvals',  value: summary.pendingApprovals },
      ]
    : [];

  return (
    <Box p={3}>
      <Typography variant="h6" fontWeight={600} mb={1}>Dashboard</Typography>
      <Typography color="text.secondary" fontSize={13} mb={3}>
        Welcome back, {user?.name} · {user?.role}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {cards.map(card => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontSize={12} color="text.secondary">{card.label}</Typography>
                <Typography variant="h4" fontWeight={500} mt={0.5}>{card.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}