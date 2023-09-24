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
import { AlertDialog } from './AlertDialog';
import { AlertDialogTrigger } from './ui/alert-dialog';

interface EmailPreviewHeaderProps {
  email: Email;
  userId: User['id'];
  setPreview: React.Dispatch<React.SetStateAction<string | null>>;
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export function EmailPreviewHeader({
  email,
  userId,
  setPreview,
  setSelected,
}: EmailPreviewHeaderProps) {
  const submit = useSubmit();

  return (
    <div className="max-h-48 overflow-hidden p-4 text-zinc-900">
      <h3 className="truncate">
        <span className="font-bold">From:</span> {email.from}
      </h3>
      <h3 className="truncate">
        <span className="font-bold">To:</span> {`${email.userId}@shuttle.email`}
      </h3>
      <h3 className="truncate">
        <span className="font-bold">Subject:</span> {email.subject}
      </h3>
      <h3 className="mb-4 truncate">
        <span className="font-bold">Received:</span>{' '}
        {format(email.createdAt, 'cccc, io MMMM yyyy @ hh:mm a')}
      </h3>
      <Form method="post" className="mb-4 flex gap-2">
        <input type="hidden" name="selected" value={email.id} />
        <Tooltip content="Mark as unread">
          <Button
            variant="ghost"
            size="icon"
            name="_action"
            value="markSelectedUnread"
          >
            <EnvelopeClosedIcon />
          </Button>
        </Tooltip>
        <AlertDialog
          title="Are you sure?"
          description="This action cannot be undone."
          onConfirm={() => {
            setPreview(null);
            setSelected((selected) => selected.filter((id) => id !== email.id));
            submit(
              { selected: email.id, _action: 'deleteSelected' },
              { method: 'post' }
            );
          }}
        >
          <Tooltip content="Delete">
            <AlertDialogTrigger asChild>
              <Button
                name="_action"
                value="deleteSelected"
                variant="ghost"
                size="icon"
                className="hover:bg-destructive focus:bg-destructive"
              >
                <TrashIcon />
              </Button>
            </AlertDialogTrigger>
          </Tooltip>
        </AlertDialog>
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
