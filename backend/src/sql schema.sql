CREATE TABLE users (
  id INT PRIMARY KEY IDENTITY,
  name NVARCHAR(100) NOT NULL,
  email NVARCHAR(100) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  role NVARCHAR(20) NOT NULL CHECK (role IN ('Admin','PM','Developer')),
  target_hours INT DEFAULT 40,
  created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE projects (
  id INT PRIMARY KEY IDENTITY,
  name NVARCHAR(150) NOT NULL,
  status NVARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft','Active','Completed')),
  health NVARCHAR(20) DEFAULT 'Good' CHECK (health IN ('Good','At Risk','Poor')),
  start_date DATE,
  pm_id INT FOREIGN KEY REFERENCES users(id)
);

CREATE TABLE tasks (
  id INT PRIMARY KEY IDENTITY,
  project_id INT FOREIGN KEY REFERENCES projects(id),
  assignee_id INT FOREIGN KEY REFERENCES users(id),
  title NVARCHAR(200) NOT NULL,
  status NVARCHAR(20) DEFAULT 'Todo' CHECK (status IN ('Todo','In Progress','Done')),
  estimated_hours INT
);

CREATE TABLE timesheets (
  id INT PRIMARY KEY IDENTITY,
  task_id INT FOREIGN KEY REFERENCES tasks(id),
  user_id INT FOREIGN KEY REFERENCES users(id),
  log_date DATE NOT NULL,
  hours_logged FLOAT NOT NULL
);