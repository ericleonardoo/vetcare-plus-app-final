'use client';

import { TriangleAlert } from 'lucide-react';

export default function BetaBanner() {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-medium text-yellow-900 shadow-lg animate-pulse">
      <TriangleAlert className="h-5 w-5" />
      <span>
        <b>Beta:</b> Sistema em desenvolvimento.
      </span>
    </div>
  );
}
