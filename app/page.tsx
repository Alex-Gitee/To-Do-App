import { archiveTaskAction, createTask } from './actions';
import { getTasks, getTaskCounts } from '@/lib/tasks';
import ArchiveButton from './ArchiveButton';
import { isOverdue, dueDateLabel } from '@/lib/overdue';

const topicColors = ['#2F6F5E', '#B0402A', '#4A5B8C', '#8A6D3B', '#6B4A8C'];
function colorForTopic(topic: string) {
  const hash = topic.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return topicColors[hash % topicColors.length];
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sortBy = (params.sort as 'topic' | 'status' | 'due_date') || 'due_date';
  const tasks = getTasks(sortBy);
  const counts = getTaskCounts();

  return (
    <main className="min-h-screen bg-paper text-ink font-serif px-6 py-10 max-w-3xl mx-auto">
      <header className="mb-8 border-b-2 border-ink pb-4">
        <div className="flex items-baseline justify-between">
          <h1 className="font-mono text-2xl tracking-tight uppercase">Task Index</h1>
          <a href="/archived" className="font-mono text-xs uppercase tracking-wide text-sage hover:text-ink">
            Archived Tasks →
          </a>
        </div>
        <p className="font-mono text-xs uppercase tracking-wide text-sage mt-2">
          {counts.active} active · {counts.overdue} overdue · {counts.archived} archived
        </p>
      </header>

      <form action={createTask} className="mb-8 grid grid-cols-2 gap-3 font-mono text-sm">
        <input name="title" placeholder="Title" required
          className="col-span-2 border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-pine" />
        <input name="description" placeholder="Description"
          className="col-span-2 border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-pine" />
        <input name="dueDate" type="date" required
          className="border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-pine" />
        <input name="topic" placeholder="Topic" required
          className="border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-pine" />
        <button type="submit"
          className="col-span-2 bg-pine text-paper py-2 uppercase tracking-wide hover:opacity-90">
          Add Task
        </button>
      </form>

      <nav className="font-mono text-xs uppercase tracking-wide mb-6 flex gap-4 text-sage">
        <span>Sort:</span>
        <a href="/?sort=topic" className="hover:text-ink">Topic</a>
        <a href="/?sort=status" className="hover:text-ink">Status</a>
        <a href="/?sort=due_date" className="hover:text-ink">Due Date</a>
      </nav>

      {tasks.length === 0 ? (
        <p className="font-mono text-sm text-sage border border-dashed border-rule px-4 py-8 text-center">
          No tasks yet — add one above to get started.
        </p>
      ) : (
      <ul className="space-y-3">
        {tasks.map((task: any) => (
          <li
            key={task.id}
            className="relative border border-rule bg-paper pl-4 pr-4 py-3"
            style={{ borderLeftWidth: 6, borderLeftColor: colorForTopic(task.topic) }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-serif text-lg">{task.title}</span>
              {isOverdue(task) && (
                <span className="font-mono text-xs uppercase text-brick border border-brick px-2 py-0.5 shrink-0">
                  Overdue
                </span>
              )}
            </div>
            <div className="font-mono text-xs uppercase tracking-wide text-sage mt-1">
              {task.topic} · {task.status} · due {task.due_date} · {dueDateLabel(task.due_date, task.status)}
            </div>
            <div className="font-mono text-xs uppercase tracking-wide mt-2 flex gap-3">
              <a href={`/tasks/${task.id}/edit`} className="text-pine hover:underline">Edit</a>
              <ArchiveButton taskId={task.id} />
            </div>
          </li>
        ))}
      </ul>
      )}
    </main>
  );
}