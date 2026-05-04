import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import supabase from '../config/db';

const router = Router();

router.get('/', auth(['Admin', 'PM']), async (_req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase
    .from('milestones')
    .select('*, projects(name)')
    .order('due_date');
  res.json(data?.map(m => ({ ...m, project_name: (m.projects as any)?.name })) ?? []);
});

router.get('/project/:projectId', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', Number(req.params.projectId))
    .order('due_date');
  res.json(data ?? []);
});

router.post('/', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, title, due_date } = req.body as {
    project_id: number; title: string; due_date: string;
  };
  const { error } = await supabase.from('milestones').insert({ project_id, title, due_date });
  if (error) { res.status(400).json({ message: error.message }); return; }
  res.status(201).json({ message: 'Milestone created' });
});

router.patch('/:id', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body as { status: string };
  await supabase.from('milestones').update({ status }).eq('id', Number(req.params.id));
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth(['Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  await supabase.from('milestones').delete().eq('id', Number(req.params.id));
  res.json({ message: 'Deleted' });
});

export default router;