import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import supabase from '../config/db';

const router = Router();

router.get('/', auth(['Admin', 'PM', 'Developer']), async (_req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase.from('resources').select('*').order('type').order('name');
  res.json(data ?? []);
});

router.post('/', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, type, description } = req.body as { name: string; type: string; description: string };
  const { error } = await supabase.from('resources').insert({ name, type, description: description ?? '' });
  if (error) { res.status(400).json({ message: error.message }); return; }
  res.status(201).json({ message: 'Resource created' });
});

// DELETE single allocation
router.delete('/allocate/:id', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  await supabase.from('project_resources').delete().eq('id', Number(req.params.id));
  res.json({ message: 'Allocation removed' });
});

// DELETE all resources
router.delete('/', auth(['Admin']), async (_req: AuthRequest, res: Response): Promise<void> => {
  await supabase.from('project_resources').delete().neq('id', 0);
  await supabase.from('resources').delete().neq('id', 0);
  res.json({ message: 'All resources deleted' });
});

// DELETE single resource
router.delete('/:id', auth(['Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  await supabase.from('project_resources').delete().eq('resource_id', Number(req.params.id));
  await supabase.from('resources').delete().eq('id', Number(req.params.id));
  res.json({ message: 'Resource deleted' });
});

// GET allocations for a project
router.get('/project/:projectId', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase
    .from('project_resources')
    .select('*, resources(name, type, description)')
    .eq('project_id', Number(req.params.projectId));
  res.json(data?.map(r => ({
    ...r,
    name:        (r.resources as any)?.name,
    type:        (r.resources as any)?.type,
    description: (r.resources as any)?.description
  })) ?? []);
});

// POST allocate
router.post('/allocate', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, resource_id, notes } = req.body as {
    project_id: number; resource_id: number; notes: string;
  };
  const { error } = await supabase.from('project_resources').insert({ project_id, resource_id, notes: notes ?? '' });
  if (error) { res.status(400).json({ message: error.message }); return; }
  res.status(201).json({ message: 'Resource allocated' });
});

export default router;