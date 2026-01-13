import React from 'react';
import Skeleton from './Skeleton';

export default function LoadingCard({ compact = false }){
  return (
    <div className={`card-base p-4 ${compact ? 'w-full' : 'w-80'} space-y-3`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}
