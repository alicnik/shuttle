import * as React from 'react';
import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import type { TooltipContentProps } from '@radix-ui/react-tooltip';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: TooltipContentProps['side'];
  sideOffset?: TooltipContentProps['sideOffset'];
}
export function Tooltip({
  content,
  children,
  side = 'top',
  sideOffset = 0,
}: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipComponent>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          className="max-w-lg break-words"
          side={side}
          sideOffset={sideOffset}
        >
          {content}
        </TooltipContent>
      </TooltipComponent>
    </TooltipProvider>
  );
}
