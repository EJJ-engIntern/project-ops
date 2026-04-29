import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool, poolConnect, sql } from '../config/db';
import { Role } from '../types';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, target_hours } = req.body as {
    name: string; email: string; password: string; role: Role; target_hours: number;
  };
  await poolConnect;
  try {
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .input('role', sql.NVarChar, role ?? 'Developer')
      .input('target_hours', sql.Int, target_hours ?? 40)
      .query('INSERT INTO users (name,email,password_hash,role,target_hours) VALUES (@name,@email,@password,@role,@target_hours)');
    res.status(201).json({ message: 'User created' });
  } catch (e: unknown) {
    res.status(400).json({ message: (e as Error).message });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  await poolConnect;
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .query('SELECT * FROM users WHERE email = @email');
  const user = result.recordset[0];
  if (!user || user.password_hash !== password) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

export default router;