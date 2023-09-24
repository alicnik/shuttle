import * as React from 'react';

import { cn } from '~/lib';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  append?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, append, ...props }, ref) => {
    if (append) {
      return (
        <div
          className={cn(
            'flex h-9 w-full gap-2 rounded-md border border-input pr-3  text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        >
          <input
            className="flex-1 bg-transparent py-1 pl-3"
            type={type}
            ref={ref}
            {...props}
          />
          <span className="self-center text-muted-foreground">{append}</span>
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
