import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { pool, poolConnect, sql } from '../config/db';

const router = Router();

router.get('/', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  let query = `SELECT p.*, u.name as pm_name FROM projects p LEFT JOIN users u ON p.pm_id = u.id`;
  if (req.user!.role === 'Developer') {
    query = `SELECT DISTINCT p.*, u.name as pm_name FROM projects p
      LEFT JOIN users u ON p.pm_id = u.id
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE t.assignee_id = ${req.user!.id}`;
  }
  const result = await pool.request().query(query);
  res.json(result.recordset);
});

router.post('/', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, start_date, pm_id } = req.body as { name: string; start_date: string; pm_id: number };
  await poolConnect;
  const pid = req.user!.role === 'PM' ? req.user!.id : pm_id;
  await pool.request()
    .input('name', sql.NVarChar, name)
    .input('start_date', sql.Date, start_date)
    .input('pm_id', sql.Int, pid)
    .query('INSERT INTO projects (name,start_date,pm_id) VALUES (@name,@start_date,@pm_id)');
  res.status(201).json({ message: 'Project created' });
});

router.patch('/:id', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, health } = req.body as { status: string; health: string };
  await poolConnect;
  await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .input('status', sql.NVarChar, status)
    .input('health', sql.NVarChar, health)
    .query('UPDATE projects SET status=@status, health=@health WHERE id=@id');
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth(['Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .query('DELETE FROM projects WHERE id=@id');
  res.json({ message: 'Deleted' });
});

export default router;