import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

const app = express();

// completely open CORS — no restrictions
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import timesheetRoutes from './routes/timesheets';
import userRoutes from './routes/users';
import resourceRoutes from './routes/resources';
import milestoneRoutes from './routes/milestones';

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/milestones', milestoneRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));