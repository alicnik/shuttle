import type { Email } from '@prisma/client';
import clsx from 'clsx';

export function EmailPreviewBody({ html }: { html?: Email['html'] }) {
  return (
    <iframe
      className={clsx('email-preview', 'h-full w-full')}
      srcDoc={html}
      title="Email preview"
    />
  );
}
