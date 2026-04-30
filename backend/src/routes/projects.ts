import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { pool, poolConnect, sql } from '../config/db';
import { Router, Request, Response } from 'express';

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

  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .input('start_date', sql.Date, start_date)
    .input('pm_id', sql.Int, pid)
    .query('INSERT INTO projects (name,start_date,pm_id) OUTPUT INSERTED.id VALUES (@name,@start_date,@pm_id)');

  const newProjectId = result.recordset[0].id;

  // Fire Power Automate webhook (non-blocking)
  const PA_WEBHOOK_URL = process.env.PA_WEBHOOK_URL;
  if (PA_WEBHOOK_URL) {
    fetch(PA_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: newProjectId,
        projectName: name,
        submittedBy: req.user!.name,
        startDate: start_date,
        approvalCallbackUrl: `${process.env.BACKEND_URL}/api/projects/webhooks/approval`
      })
    }).catch(err => console.error('PA webhook failed:', err));
  }

  res.status(201).json({ message: 'Project created', projectId: newProjectId });
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

router.get('/summary', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;

  const projects = await pool.request().query(`SELECT COUNT(*) as total FROM projects WHERE status = 'Active'`);
  const tasks = await pool.request().query(`SELECT COUNT(*) as total FROM tasks WHERE status != 'Done'`);
  const hours = await pool.request().query(`
    SELECT ISNULL(SUM(hours_logged), 0) as total 
    FROM timesheets 
    WHERE log_date >= DATEADD(day, -7, GETDATE())
  `);
  const approvals = await pool.request().query(`SELECT COUNT(*) as total FROM projects WHERE status = 'Draft'`);

  res.json({
    activeProjects: projects.recordset[0].total,
    openTasks: tasks.recordset[0].total,
    hoursThisWeek: hours.recordset[0].total,
    pendingApprovals: approvals.recordset[0].total
  });
});

// POST /api/webhooks/approval — called by Power Automate when admin approves
router.post('/webhooks/approval', async (req: Request, res: Response): Promise<void> => {
  const { projectId, action } = req.body as { projectId: number; action: 'approve' | 'reject' };
  await poolConnect;

  if (action === 'approve') {
    await pool.request()
      .input('id', sql.Int, projectId)
      .query(`UPDATE projects SET status = 'Active' WHERE id = @id`);
    res.json({ message: 'Project approved and set to Active' });
  } else if (action === 'reject') {
    await pool.request()
      .input('id', sql.Int, projectId)
      .query(`UPDATE projects SET status = 'Draft' WHERE id = @id`);
    res.json({ message: 'Project rejected' });
  } else {
    res.status(400).json({ message: 'Invalid action' });
  }
});

export default router;