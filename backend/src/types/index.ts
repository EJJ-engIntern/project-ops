export type Role = 'Admin' | 'PM' | 'Developer';

export interface AuthUser {
  id: number;
  name: string;
  role: Role;
}

export interface Project {
  id: number;
  name: string;
  status: 'Draft' | 'Active' | 'Completed';
  health: 'Good' | 'At Risk' | 'Poor';
  start_date: string;
  pm_id: number;
  pm_name?: string;
}

export interface Task {
  id: number;
  project_id: number;
  assignee_id: number;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
  estimated_hours: number;
  assignee_name?: string;
  project_name?: string;
}

export interface Timesheet {
  id: number;
  task_id: number;
  user_id: number;
  log_date: string;
  hours_logged: number;
  user_name?: string;
  task_title?: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: Role;
  target_hours: number;
}

export interface Resource {
  id: number;
  name: string;
  type: 'Software' | 'Hardware' | 'Human';
  description: string;
  available: boolean;
}

export interface ProjectResource {
  id: number;
  name: string;
  type: string;
  description: string;
  notes: string;
  allocated_on: string;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  due_date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  project_name?: string;
}

export interface JwtPayload {
  id: string;
  email: string;
}