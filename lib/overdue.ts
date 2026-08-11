export function isOverdue(task: { due_date: string; status: string }) {
  return new Date(task.due_date) < new Date() && task.status !== 'complete';
}

export function dueDateLabel(dueDate: string, status: string) {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (status === 'complete') return `due ${dueDate}`;
  if (diffDays === 0) return 'due today';
  if (diffDays > 0) return `due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`;
}