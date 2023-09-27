import clsx from 'clsx';
import type { Email } from '@prisma/client';

export function EmailPreviewBody({ html }: { html?: Email['html'] }) {
  return (
    <iframe
      className={clsx('email-preview', 'h-full w-full')}
      srcDoc={html}
      title="Email preview"
    />
  );
}
