import { archiveTaskAction, createTask } from './actions';
import { getTasks } from '@/lib/tasks';

function isOverdue(task: { due_date: string; status: string }) {
  return new Date(task.due_date) < new Date() && task.status !== 'complete';
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sortBy = (params.sort as 'topic' | 'status' | 'due_date') || 'due_date';
  const tasks = getTasks(sortBy);

  return (
    <main style={{ padding: 24 }}>
      <h1>My Tasks</h1>
      <a href="/archived">View archived tasks</a>
      <form action={createTask}>
        <input name="title" placeholder="Title" required />
        <input name="description" placeholder="Description" />
        <input name="dueDate" type="date" required />
        <input name="topic" placeholder="Topic" required />
        <button type="submit">Add Task</button>
      </form>

      <div>
        Sort by:
        <a href="/?sort=topic"> Topic</a> |
        <a href="/?sort=status"> Status</a> |
        <a href="/?sort=due_date"> Due Date</a>
      </div>

      <ul>
        {tasks.map((task: any) => (
          <li key={task.id}>
            {task.title} — {task.topic} — {task.status} — due {task.due_date}
            {isOverdue(task) && 'Overdue'}
            {' '}<a href={`/tasks/${task.id}/edit`}>Edit</a>
            {' '}
            <form action={archiveTaskAction} style={{ display: 'inline' }}>
              <input type="hidden" name="id" value={task.id} />
              <button type="submit">Archive</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}