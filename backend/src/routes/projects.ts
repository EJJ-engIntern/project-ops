import { Router, Request, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import supabase from '../config/db';

const router = Router();

router.get('/summary', auth(['Admin', 'PM', 'Developer']), async (_req: AuthRequest, res: Response): Promise<void> => {
  const { count: activeProjects }  = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Active');
  const { count: openTasks }       = await supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'Done');
  const { count: pendingApprovals} = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Draft');

  const { data: hoursData } = await supabase
    .from('timesheets')
    .select('hours_logged')
    .gte('log_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const hoursThisWeek = hoursData?.reduce((sum, r) => sum + r.hours_logged, 0) ?? 0;

  res.json({ activeProjects, openTasks, hoursThisWeek, pendingApprovals });
});

router.get('/', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user!.role === 'Developer') {
    const { data: taskData } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('assignee_id', req.user!.id);
    const projectIds = [...new Set(taskData?.map(t => t.project_id) ?? [])];
    const { data } = await supabase
      .from('projects')
      .select('*, users(name)')
      .in('id', projectIds);
    res.json(data?.map(p => ({ ...p, pm_name: (p.users as any)?.name })) ?? []);
    return;
  }
  const { data } = await supabase.from('projects').select('*, users(name)');
  res.json(data?.map(p => ({ ...p, pm_name: (p.users as any)?.name })) ?? []);
});

router.post('/', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, start_date, pm_id } = req.body as { name: string; start_date: string; pm_id: number };
  const pid = req.user!.role === 'PM' ? req.user!.id : pm_id;

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, start_date, pm_id: pid })
    .select('id')
    .single();

  if (error) { res.status(400).json({ message: error.message }); return; }

  const PA_WEBHOOK_URL = process.env.PA_WEBHOOK_URL;
  if (PA_WEBHOOK_URL) {
    fetch(PA_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: data.id,
        projectName: name,
        submittedBy: req.user!.name,
        startDate: start_date,
        approvalCallbackUrl: `${process.env.BACKEND_URL}/api/projects/webhooks/approval`
      })
    }).catch(err => console.error('PA webhook failed:', err));
  }

  res.status(201).json({ message: 'Project created', projectId: data.id });
});

router.patch('/:id', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, health } = req.body as { status: string; health: string };
  const { error } = await supabase.from('projects').update({ status, health }).eq('id', Number(req.params.id));
  if (error) { res.status(400).json({ message: error.message }); return; }
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth(['Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { error } = await supabase.from('projects').delete().eq('id', Number(req.params.id));
  if (error) { res.status(400).json({ message: error.message }); return; }
  res.json({ message: 'Deleted' });
});

router.post('/webhooks/approval', async (req: Request, res: Response): Promise<void> => {
  const { projectId, action } = req.body as { projectId: number; action: 'approve' | 'reject' };
  const status = action === 'approve' ? 'Active' : 'Draft';
  await supabase.from('projects').update({ status }).eq('id', projectId);
  res.json({ message: `Project ${action}d` });
});

export default router;