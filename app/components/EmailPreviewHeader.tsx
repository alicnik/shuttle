import { Form, Link, useSubmit } from '@remix-run/react';
import { format } from 'date-fns';
import { Tooltip } from './Tooltip';
import { Button, Separator } from './ui';
import type { Email, User } from '@prisma/client';
import {
  EnvelopeClosedIcon,
  ExternalLinkIcon,
  TrashIcon,
} from '@radix-ui/react-icons';

interface EmailPreviewHeaderProps {
  email: Email;
  userId: User['id'];
}

export function EmailPreviewHeader({ email, userId }: EmailPreviewHeaderProps) {
  const submit = useSubmit();

  return (
    <div className="p-4 text-zinc-900">
      <h3>
        <span className="font-bold">From:</span> {email.from}
      </h3>
      <h3>
        <span className="font-bold">To:</span> {`${email.userId}@shuttle.email`}
      </h3>
      <h3>
        <span className="font-bold">Subject:</span> {email.subject}
      </h3>
      <h3 className="mb-4">
        <span className="font-bold">Received:</span>{' '}
        {format(email.createdAt, 'cccc, io MMMM yyyy @ hh:mm a')}
      </h3>
      <Form method="post" className="mb-4 flex gap-2">
        <input type="hidden" name="emailId" value={email.id} />
        <Tooltip content="Mark as unread">
          <Button variant="ghost" size="icon" name="_action" value="markUnread">
            <EnvelopeClosedIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Delete">
          <Button name="_action" value="delete" variant="ghost" size="icon">
            <TrashIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Open in new window">
          <Link to={`/${userId}/${email.id}`} target="_blank">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                submit(
                  { emailId: email.id, _action: 'markRead' },
                  { method: 'post' }
                );
              }}
            >
              <ExternalLinkIcon />
            </Button>
          </Link>
        </Tooltip>
      </Form>
      <Separator />
    </div>
  );
}
