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
        className="translate-y-[3px] cursor-pointer"
        onClick={async () => {
          await navigator.clipboard.writeText(copyText);
          toast({ description: successMessage });
        }}
      />
    </Tooltip>
  );
}
