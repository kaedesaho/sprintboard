-- SprintBoard database schema
-- Usage: psql -U postgres -d sprintboard_db -f backend/schema.sql

-- Types

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

CREATE TYPE task_status AS ENUM (
    'backlog',
    'todo',
    'in_progress',
    'testing',
    'review',
    'blocked',
    'done'
);

CREATE TYPE note_type_enum AS ENUM (
    'meeting',
    'retrospective',
    'personal',
    'task-related',
    'documentation'
);

-- Tables

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    photo_url VARCHAR(500)
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cur_sprint INT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE project_members (
    project_id INT REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'backlog',
    priority task_priority,
    sprint INT,
    start_date DATE,
    end_date DATE,
    time_estimation INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    project_id INT REFERENCES projects(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE task_assignees (
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    UNIQUE (project_id, name)
);

CREATE TABLE task_categories (
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, category_id)
);

CREATE TABLE task_dependencies (
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, depends_on_task_id),
    CHECK (task_id <> depends_on_task_id)
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT '',
    note_type note_type_enum NOT NULL DEFAULT 'meeting',
    sprint_num INT,
    creator_id INT REFERENCES users(id) NOT NULL,
    leader_id INT REFERENCES users(id),
    note_taker_id INT REFERENCES users(id),
    planned_time TIMESTAMP,
    place VARCHAR(255),
    content TEXT NOT NULL DEFAULT '',
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Keep updated_at current on every UPDATE

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_set_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_set_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
