import db from './db';

export function getTasks(sortBy: 'topic' | 'status' | 'due_date' = 'due_date') {
  const validColumns = ['topic', 'status', 'due_date'];
  const column = validColumns.includes(sortBy) ? sortBy : 'due_date';

  return db.prepare(`
    SELECT * FROM tasks
    WHERE archived_at IS NULL
    ORDER BY ${column}
  `).all();
}