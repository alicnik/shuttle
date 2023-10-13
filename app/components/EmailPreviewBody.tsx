import clsx from 'clsx';
import type { Email } from '@prisma/client';
import * as React from 'react';

export function EmailPreviewBody({ html }: { html?: Email['html'] }) {
  const htmlWithBaseTag = React.useMemo(() => {
    if (!html) return '';

    // This ensures links open in a new tab and not in the iframe
    const baseTag = '<base target="_blank">';
    const headTag = '<head>';
    const headTagIndex = html.indexOf(headTag);

    if (headTagIndex === -1) {
      return html;
    }

    return (
      html.slice(0, headTagIndex + headTag.length) +
      baseTag +
      html.slice(headTagIndex + headTag.length)
    );
  }, [html]);

  return (
    <iframe
      data-testid="email-preview-body"
      className={clsx('email-preview', 'h-full w-full')}
      srcDoc={htmlWithBaseTag}
      title="Email preview"
    />
  );
}
