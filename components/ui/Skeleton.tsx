interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'text' | 'circle';
}

export default function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-800';
  
  const variantClasses = {
    rect: 'rounded-lg',
    text: 'rounded h-4',
    circle: 'rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

