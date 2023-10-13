import { ClipboardCopyIcon } from '@radix-ui/react-icons';
import { useToast } from './ui';
import { Tooltip } from './Tooltip';
import type { TooltipProps } from './Tooltip';

interface CopyToClipboardProps {
  copyText: string;
  successMessage: string;
  tooltipOptions: Omit<TooltipProps, 'children'>;
}

export function CopyToClipboard({
  copyText,
  successMessage,
  tooltipOptions: { content, side = 'top', sideOffset = 0 },
}: CopyToClipboardProps) {
  const { toast } = useToast();

  return (
    <Tooltip content={content} side={side} sideOffset={sideOffset}>
      <ClipboardCopyIcon
        data-testid="clipboard-copy-icon"
        className="translate-y-[3px] cursor-pointer"
        onClick={async () => {
          const blob = new Blob([copyText], { type: 'text/plain' });
          const item = new ClipboardItem({ 'text/plain': blob });
          await navigator.clipboard.write([item]);
          toast({ description: successMessage });
        }}
      />
    </Tooltip>
  );
}
