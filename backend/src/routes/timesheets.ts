import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { pool, poolConnect, sql } from '../config/db';

const router = Router();

router.get('/', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  let query = `SELECT ts.*, u.name as user_name, t.title as task_title
    FROM timesheets ts LEFT JOIN users u ON ts.user_id=u.id
    LEFT JOIN tasks t ON ts.task_id=t.id`;
  if (req.user!.role === 'Developer')
    query += ` WHERE ts.user_id=${req.user!.id}`;
  const result = await pool.request().query(query);
  res.json(result.recordset);
});

router.post('/', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { task_id, log_date, hours_logged } = req.body as {
    task_id: number; log_date: string; hours_logged: number;
  };
  await poolConnect;
  await pool.request()
    .input('task_id', sql.Int, task_id)
    .input('user_id', sql.Int, req.user!.id)
    .input('log_date', sql.Date, log_date)
    .input('hours_logged', sql.Float, hours_logged)
    .query('INSERT INTO timesheets (task_id,user_id,log_date,hours_logged) VALUES (@task_id,@user_id,@log_date,@hours_logged)');
  res.status(201).json({ message: 'Hours logged' });
});

export default router;