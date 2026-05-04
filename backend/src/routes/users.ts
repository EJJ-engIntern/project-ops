import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import supabase from '../config/db';

const router = Router();

router.get('/', auth(['Admin', 'PM']), async (_req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase.from('users').select('id, name, email, role, target_hours');
  res.json(data ?? []);
});

router.delete('/:id', auth(['Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  await supabase.from('users').delete().eq('id', Number(req.params.id));
  res.json({ message: 'Deleted' });
});

export default router;