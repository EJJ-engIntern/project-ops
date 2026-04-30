import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { pool, poolConnect, sql } from '../config/db';

const router = Router();

// GET milestones for a project
router.get('/project/:projectId', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  const result = await pool.request()
    .input('projectId', sql.Int, Number(req.params.projectId))
    .query('SELECT * FROM milestones WHERE project_id = @projectId ORDER BY due_date');
  res.json(result.recordset);
});

// GET all milestones — Admin, PM
router.get('/', auth(['Admin', 'PM']), async (_req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  const result = await pool.request().query(`
    SELECT m.*, p.name as project_name
    FROM milestones m
    JOIN projects p ON m.project_id = p.id
    ORDER BY m.due_date
  `);
  res.json(result.recordset);
});

// POST create milestone — Admin, PM only
router.post('/', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, title, due_date } = req.body as {
    project_id: number; title: string; due_date: string;
  };
  await poolConnect;
  await pool.request()
    .input('project_id', sql.Int, project_id)
    .input('title', sql.NVarChar, title)
    .input('due_date', sql.Date, due_date)
    .query('INSERT INTO milestones (project_id,title,due_date) VALUES (@project_id,@title,@due_date)');
  res.status(201).json({ message: 'Milestone created' });
});

// PATCH update milestone status
router.patch('/:id', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body as { status: string };
  await poolConnect;
  await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .input('status', sql.NVarChar, status)
    .query('UPDATE milestones SET status=@status WHERE id=@id');
  res.json({ message: 'Updated' });
});

// DELETE milestone — Admin only
router.delete('/:id', auth(['Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .query('DELETE FROM milestones WHERE id=@id');
  res.json({ message: 'Deleted' });
});

export default router;