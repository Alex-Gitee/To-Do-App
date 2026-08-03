import { getArchivedTasks } from '@/lib/tasks';

export default function ArchivedTasks() {
  const tasks = getArchivedTasks();

  return (
    <main className="min-h-screen bg-paper text-ink font-serif px-6 py-10 max-w-3xl mx-auto">
      <a href="/" className="font-mono text-xs uppercase text-sage hover:text-ink">← Active tasks</a>
      <h1 className="font-mono text-xl uppercase mt-4 mb-6">Archive</h1>
      <ul className="space-y-2">
        {tasks.map((task: any) => (
          <li key={task.id} className="border-b border-rule pb-2 text-sage">
            <span className="font-serif">{task.title}</span>
            <span className="font-mono text-xs uppercase ml-2">— {task.topic}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}