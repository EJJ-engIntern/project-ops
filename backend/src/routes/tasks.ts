import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import supabase from '../config/db';

const router = Router();

router.get('/', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  let query = supabase
    .from('tasks')
    .select('*, users(name), projects(name)');

  if (req.user!.role === 'Developer') {
    query = query.eq('assignee_id', req.user!.id) as any;
  }

  const { data } = await query;
  res.json(data?.map(t => ({
    ...t,
    assignee_name: (t.users as any)?.name,
    project_name:  (t.projects as any)?.name
  })) ?? []);
});

router.post('/', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, assignee_id, title, estimated_hours } = req.body as {
    project_id: number; assignee_id: number; title: string; estimated_hours: number;
  };
  const { error } = await supabase.from('tasks').insert({ project_id, assignee_id, title, estimated_hours });
  if (error) { res.status(400).json({ message: error.message }); return; }
  res.status(201).json({ message: 'Task created' });
});

router.patch('/:id', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body as { status: string };
  const { data: task } = await supabase.from('tasks').select('assignee_id').eq('id', Number(req.params.id)).single();
  if (req.user!.role === 'Developer' && task?.assignee_id !== req.user!.id) {
    res.status(403).json({ message: 'Not your task' });
    return;
  }
  await supabase.from('tasks').update({ status }).eq('id', Number(req.params.id));
  res.json({ message: 'Updated' });
});

export default router;