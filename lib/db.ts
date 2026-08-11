import Database from 'better-sqlite3';
import path from 'path';

const dbFile = process.env.DB_PATH || path.join(process.cwd(), 'data', 'tasks.sqlite');
const db = new Database(dbFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'complete')),
    archived_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;