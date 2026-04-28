import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { pool, poolConnect, sql } from '../config/db';

const router = Router();

router.get('/', auth(['Admin', 'PM']), async (_req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  const result = await pool.request()
    .query('SELECT id, name, email, role, target_hours FROM users');
  res.json(result.recordset);
});

router.delete('/:id', auth(['Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .query('DELETE FROM users WHERE id=@id');
  res.json({ message: 'Deleted' });
});

export default router;