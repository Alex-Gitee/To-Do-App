import db from '@/lib/db';
import { editTask } from '@/app/actions';

export default async function EditTask({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task: any = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  const boundEditTask = editTask.bind(null, task.id);

  return (
    <form action={boundEditTask}>
      <input name="title" defaultValue={task.title} required />
      <input name="description" defaultValue={task.description} />
      <input name="dueDate" type="date" defaultValue={task.due_date} required />
      <input name="topic" defaultValue={task.topic} required />
      <select name="status" defaultValue={task.status}>
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="complete">Complete</option>
      </select>
      <button type="submit">Save</button>
    </form>
  );
}