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

export function updateTask(id: number, task: {
  title: string;
  description: string;
  dueDate: string;
  topic: string;
  status: string;
}) {
  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, due_date = ?, topic = ?, status = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(task.title, task.description, task.dueDate, task.topic, task.status, id);
}

export function getTaskById(id: number) {
  return db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(id);
}