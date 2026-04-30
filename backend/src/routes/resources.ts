import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { pool, poolConnect, sql } from '../config/db';

const router = Router();

// GET all resources
router.get('/', auth(['Admin', 'PM', 'Developer']), async (_req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  const result = await pool.request().query('SELECT * FROM resources ORDER BY type, name');
  res.json(result.recordset);
});

// POST create resource
router.post('/', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, type, description } = req.body as { name: string; type: string; description: string };
  await poolConnect;
  await pool.request()
    .input('name', sql.NVarChar, name)
    .input('type', sql.NVarChar, type)
    .input('description', sql.NVarChar, description ?? '')
    .query('INSERT INTO resources (name,type,description) VALUES (@name,@type,@description)');
  res.status(201).json({ message: 'Resource created' });
});

// DELETE single resource — Admin only
// Also removes all allocations of this resource first
router.delete('/:id', auth(['Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .query('DELETE FROM project_resources WHERE resource_id = @id');
  await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .query('DELETE FROM resources WHERE id = @id');
  res.json({ message: 'Resource deleted' });
});

// DELETE all resources — Admin only
// Clears all allocations first, then all resources
router.delete('/', auth(['Admin']), async (_req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  await pool.request().query('DELETE FROM project_resources');
  await pool.request().query('DELETE FROM resources');
  res.json({ message: 'All resources deleted' });
});

// GET resources allocated to a project
router.get('/project/:projectId', auth(['Admin', 'PM', 'Developer']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  const result = await pool.request()
    .input('projectId', sql.Int, Number(req.params.projectId))
    .query(`
      SELECT pr.id, pr.notes, pr.allocated_on, r.name, r.type, r.description
      FROM project_resources pr
      JOIN resources r ON pr.resource_id = r.id
      WHERE pr.project_id = @projectId
    `);
  res.json(result.recordset);
});

// POST allocate resource to project
router.post('/allocate', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, resource_id, notes } = req.body as {
    project_id: number; resource_id: number; notes: string;
  };
  await poolConnect;
  await pool.request()
    .input('project_id', sql.Int, project_id)
    .input('resource_id', sql.Int, resource_id)
    .input('notes', sql.NVarChar, notes ?? '')
    .query('INSERT INTO project_resources (project_id,resource_id,notes) VALUES (@project_id,@resource_id,@notes)');
  res.status(201).json({ message: 'Resource allocated' });
});

// DELETE single allocation
router.delete('/allocate/:id', auth(['Admin', 'PM']), async (req: AuthRequest, res: Response): Promise<void> => {
  await poolConnect;
  await pool.request()
    .input('id', sql.Int, Number(req.params.id))
    .query('DELETE FROM project_resources WHERE id = @id');
  res.json({ message: 'Allocation removed' });
});

export default router;