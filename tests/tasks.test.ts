import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../lib/db.test-helper';

describe('tasks', () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb(); // fresh, empty database before every single test
  });

  it('creates a task with all four required fields', () => {
    db.prepare(`
      INSERT INTO tasks (title, description, due_date, topic, status)
      VALUES (?, ?, ?, ?, 'todo')
    `).run('Essay', 'Write it', '2026-08-01', 'Coursework');

    const task = db.prepare('SELECT * FROM tasks WHERE title = ?').get('Essay');
    expect(task.topic).toBe('Coursework');
    expect(task.status).toBe('todo');
  });

  it('archiving removes a task from the active list but keeps it queryable', () => {
    const result = db.prepare(`
      INSERT INTO tasks (title, due_date, topic, status)
      VALUES ('Report', '2026-08-01', 'Work', 'todo')
    `).run();
    const id = result.lastInsertRowid;

    db.prepare(`UPDATE tasks SET archived_at = datetime('now') WHERE id = ?`).run(id);

    const active = db.prepare('SELECT * FROM tasks WHERE archived_at IS NULL').all();
    const archived = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    expect(active.find((t: any) => t.id === id)).toBeUndefined();
    expect(archived).toBeDefined();
  });

  it('a past-due incomplete task is overdue; a past-due complete task is not', () => {
    function isOverdue(task: { due_date: string; status: string }) {
      return new Date(task.due_date) < new Date() && task.status !== 'complete';
    }

    expect(isOverdue({ due_date: '2020-01-01', status: 'todo' })).toBe(true);
    expect(isOverdue({ due_date: '2020-01-01', status: 'complete' })).toBe(false);
  });
});