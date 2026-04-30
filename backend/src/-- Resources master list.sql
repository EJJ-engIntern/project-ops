-- Resources master list
CREATE TABLE resources (
  id INT PRIMARY KEY IDENTITY,
  name NVARCHAR(150) NOT NULL,
  type NVARCHAR(20) NOT NULL CHECK (type IN ('Software','Hardware','Human')),
  description NVARCHAR(255),
  available BIT DEFAULT 1
);

-- Resources allocated to projects
CREATE TABLE project_resources (
  id INT PRIMARY KEY IDENTITY,
  project_id INT FOREIGN KEY REFERENCES projects(id),
  resource_id INT FOREIGN KEY REFERENCES resources(id),
  allocated_on DATE DEFAULT GETDATE(),
  notes NVARCHAR(255)
);

-- Milestones per project
CREATE TABLE milestones (
  id INT PRIMARY KEY IDENTITY,
  project_id INT FOREIGN KEY REFERENCES projects(id),
  title NVARCHAR(200) NOT NULL,
  due_date DATE,
  status NVARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Completed')),
  created_at DATETIME DEFAULT GETDATE()
);



