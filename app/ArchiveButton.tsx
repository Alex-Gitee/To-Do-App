'use client';

import { useState } from 'react';
import { archiveTaskAction } from './actions';

export default function ArchiveButton({ taskId }: { taskId: number }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sage hover:text-brick font-mono text-xs uppercase tracking-wide"
      >
        Archive
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-mono text-xs uppercase tracking-wide text-brick">Sure?</span>
      <form action={archiveTaskAction} className="inline">
        <input type="hidden" name="id" value={taskId} />
        <button
          type="submit"
          className="font-mono text-xs uppercase tracking-wide text-brick underline"
        >
          Yes
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-mono text-xs uppercase tracking-wide text-sage underline"
      >
        No
      </button>
    </div>
  );
}