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
    <main className="min-h-screen bg-paper text-ink font-serif px-6 py-10 max-w-md mx-auto">
      <a href="/" className="font-mono text-xs uppercase text-sage hover:text-ink">← Back</a>
      <h1 className="font-mono text-xl uppercase mt-4 mb-6">Edit Task</h1>

      <form action={boundEditTask} className="grid gap-3 font-mono text-sm">
        <input name="title" defaultValue={task.title} required
          className="border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-pine" />
        <input name="description" defaultValue={task.description}
          className="border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-pine" />
        <input name="dueDate" type="date" defaultValue={task.due_date} required
          className="border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-pine" />
        <input name="topic" defaultValue={task.topic} required
          className="border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-pine" />
        <select name="status" defaultValue={task.status}
          className="border border-rule bg-paper px-3 py-2 focus:outline-none focus:border-pine">
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>
        <button type="submit"
          className="bg-pine text-paper py-2 uppercase tracking-wide hover:opacity-90">
          Save
        </button>
      </form>
    </main>
  );
}