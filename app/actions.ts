'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

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