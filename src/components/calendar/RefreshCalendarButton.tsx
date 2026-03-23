'use client';

import { useState } from 'react';

interface RefreshCalendarButtonProps {
  className?: string;
}

export default function RefreshCalendarButton({ className = '' }: RefreshCalendarButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleRefresh = async () => {
    if (!GIST_URL || GIST_URL === 'YOUR_GIST_RAW_URL_HERE') {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch(GIST_URL);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      localStorage.setItem('bs-calendar-data', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('bs-calendar-updated', { detail: data }));

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={status === 'loading'}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
        ${status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : ''}
        ${status === 'loading' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
        ${status === 'idle' ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300' : ''}
        ${className}
      `}
      title={status === 'error' ? 'Set GIST_URL in bsCalendar.ts first' : 'Fetch latest BS calendar data from GitHub Gist'}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={status === 'loading' ? 'animate-spin' : ''}
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
      {status === 'loading' ? 'Refreshing...' : status === 'success' ? 'Updated!' : status === 'error' ? 'Set Gist URL!' : 'Refresh Calendar'}
    </button>
  );
}

const GIST_URL = 'YOUR_GIST_RAW_URL_HERE';
