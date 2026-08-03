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

export function archiveTask(id: number) {
  db.prepare(`UPDATE tasks SET archived_at = datetime('now') WHERE id = ?`).run(id);
}

export function getArchivedTasks() {
  return db.prepare(`SELECT * FROM tasks WHERE archived_at IS NOT NULL`).all();
}

export function getTaskCounts() {
  const active = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE archived_at IS NULL`).get() as { count: number };
  const archived = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE archived_at IS NOT NULL`).get() as { count: number };
  const overdue = db.prepare(`
    SELECT COUNT(*) as count FROM tasks
    WHERE archived_at IS NULL
    AND status != 'complete'
    AND date(due_date) < date('now')
  `).get() as { count: number };

  return { active: active.count, archived: archived.count, overdue: overdue.count };
}