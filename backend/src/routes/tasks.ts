import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { pool, poolConnect, sql } from '../config/db';

const router = Router();

router.get('/', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  let query = `SELECT t.*, u.name as assignee_name, p.name as project_name
    FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id
    LEFT JOIN projects p ON t.project_id=p.id`;
  if (req.user!.role === 'Developer')
    query += ` WHERE t.assignee_id=${req.user!.id}`;
  const result = await pool.request().query(query);
  res.json(result.recordset);
});

router.post('/', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, assignee_id, title, estimated_hours } = req.body as {
    project_id: number; assignee_id: number; title: string; estimated_hours: number;
  };
  await poolConnect;
  await pool.request()
    .input('project_id', sql.Int, project_id)
    .input('assignee_id', sql.Int, assignee_id)
    .input('title', sql.NVarChar, title)
    .input('estimated_hours', sql.Int, estimated_hours)
    .query('INSERT INTO tasks (project_id,assignee_id,title,estimated_hours) VALUES (@project_id,@assignee_id,@title,@estimated_hours)');
  res.status(201).json({ message: 'Task created' });
});

router.patch('/:id', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body as { status: string };
  await poolConnect;
  const check = await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .query('SELECT assignee_id FROM tasks WHERE id=@id');
  const task = check.recordset[0];
  if (req.user!.role === 'Developer' && task.assignee_id !== req.user!.id) {
    res.status(403).json({ message: 'Not your task' });
    return;
  }
  await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .input('status', sql.NVarChar, status)
    .query('UPDATE tasks SET status=@status WHERE id=@id');
  res.json({ message: 'Updated' });
});

export default router;