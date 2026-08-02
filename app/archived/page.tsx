import { getArchivedTasks } from '@/lib/tasks';

export default function ArchivedTasks() {
  const tasks = getArchivedTasks();

  return (
    <main style={{ padding: 24 }}>
      <h1>Archived Tasks</h1>
      <a href="/">← Back to active tasks</a>
      <ul>
        {tasks.map((task: any) => (
          <li key={task.id}>
            {task.title} — {task.topic} — archived
          </li>
        ))}
      </ul>
    </main>
  );
}