import Database from 'better-sqlite3';

export function createTestDb() {
  const db = new Database(':memory:'); // exists only in RAM, gone when the test finishes
  db.exec(`
    CREATE TABLE tasks (
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
  return db;
}