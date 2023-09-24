import type { Email } from '@prisma/client';

import clsx from 'clsx';

export function EmailPreviewBody({ html }: { html?: Email['html'] }) {
  return (
    <div
      className={clsx(
        'overflow-y-auto overflow-x-hidden p-4 text-zinc-900',
        'email-preview'
      )}
      dangerouslySetInnerHTML={html ? { __html: html } : undefined}
    />
  );
}
