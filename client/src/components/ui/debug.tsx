import React from 'react';

interface DebugProps {
  data: any;
  open?: boolean;
}

export function Debug({ data, open = false }: DebugProps) {
  return (
    <details open={open} className="bg-gray-900 text-white p-4 rounded-md my-2 text-xs">
      <summary className="font-bold cursor-pointer">Debug Data</summary>
      <pre className="mt-2 whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}