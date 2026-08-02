import db from '@/lib/db';
import { createTask } from './actions';

export default function Home() {
  const tasks = db.prepare(`SELECT * FROM tasks WHERE archived_at IS NULL`).all();

  return (
    <main style={{ padding: 24 }}>
      <h1>My Tasks</h1>

      <form action={createTask}>
        <input name="title" placeholder="Title" required />
        <input name="description" placeholder="Description" />
        <input name="dueDate" type="date" required />
        <input name="topic" placeholder="Topic" required />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map((task: any) => (
          <li key={task.id}>
            {task.title} — {task.topic} — {task.status} — due {task.due_date}
          </li>
        ))}
      </ul>
    </main>
  );
}