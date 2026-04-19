import { type ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div
      className={`px-4 sm:px-6 lg:px-8 flex min-h-screen flex-col items-center justify-center ${className} max-w-[425px] mx-auto border-2 border-red-200`}
    >
      {children}
    </div>
  );
}
