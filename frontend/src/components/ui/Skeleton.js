import React from 'react';

// Skeleton component: renders a neutral block with a shimmer overlay via CSS ::after
export default function Skeleton({ className = 'h-4 w-full rounded-md', style = {}, ariaLabel = 'Loading placeholder', variant = 'default', shimmer = true }) {
  const variantClass = variant === 'rich' ? 'rich' : '';
  const noShimmer = shimmer ? '' : 'no-shimmer';

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`skeleton ${variantClass} ${noShimmer} ${className}`}
      style={style}
    />
  );
}
