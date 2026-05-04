import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import supabase from '../config/db';

const router = Router();

router.get('/', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  let query = supabase.from('timesheets').select('*, users(name), tasks(title)');
  if (req.user!.role === 'Developer') {
    query = query.eq('user_id', req.user!.id) as any;
  }
  const { data } = await query;
  res.json(data?.map(t => ({
    ...t,
    user_name:  (t.users as any)?.name,
    task_title: (t.tasks as any)?.title
  })) ?? []);
});

router.post('/', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { task_id, log_date, hours_logged } = req.body as {
    task_id: number; log_date: string; hours_logged: number;
  };
  const { error } = await supabase.from('timesheets').insert({ task_id, user_id: req.user!.id, log_date, hours_logged });
  if (error) { res.status(400).json({ message: error.message }); return; }
  res.status(201).json({ message: 'Hours logged' });
});

export default router;