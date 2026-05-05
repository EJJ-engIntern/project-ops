import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import timesheetRoutes from './routes/timesheets';
import userRoutes from './routes/users';
import resourceRoutes from './routes/resources';
import milestoneRoutes from './routes/milestones';

const app = express();

// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'https://project-1a1x73dtg-emmanuel-james-projects-92154ea8.vercel.app',
//     /\.vercel\.app$/
//   ],
//   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors({
  origin: process.env.CORS_ORIGIN === '*' ? '*' : [
    'http://localhost:5173',
    'https://project-1a1x73dtg-emmanuel-james-projects-92154ea8.vercel.app',
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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