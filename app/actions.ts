'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDate = formData.get('dueDate') as string;
  const topic = formData.get('topic') as string;

  db.prepare(`
    INSERT INTO tasks (title, description, due_date, topic, status)
    VALUES (?, ?, ?, ?, 'todo')
  `).run(title, description, dueDate, topic);

  revalidatePath('/');
}

export async function editTask(id: number, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDate = formData.get('dueDate') as string;
  const topic = formData.get('topic') as string;
  const status = formData.get('status') as string;

  db.prepare(`
    UPDATE tasks SET title=?, description=?, due_date=?, topic=?, status=?, updated_at=datetime('now')
    WHERE id=?
  `).run(title, description, dueDate, topic, status, id);

  revalidatePath('/');
  redirect('/');
}