import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import supabase from '../config/db';
import { Role } from '../types';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, target_hours } = req.body as {
    name: string; email: string; password: string; role: Role; target_hours: number;
  };
  const { error } = await supabase
    .from('users')
    .insert({ name, email, password_hash: password, role: role ?? 'Developer', target_hours: target_hours ?? 40 });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  res.status(201).json({ message: 'User created' });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error || !data || data.password_hash !== password) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign(
    { id: data.id, name: data.name, email: data.email, role: data.role },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );
  res.json({ token, user: { id: data.id, name: data.name, role: data.role } });
});

export default router;