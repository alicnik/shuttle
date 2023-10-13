import * as React from 'react';
import { Form, Link, useSearchParams, useSubmit } from '@remix-run/react';
import { format } from 'date-fns';
import { Tooltip } from './Tooltip';
import { Button, Separator } from './ui';
import type { Email } from '@prisma/client';
import {
  EnvelopeClosedIcon,
  ExternalLinkIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { AlertDialog, AlertDialogTrigger } from './AlertDialog';
import { HarvestLinks } from './HarvestLinks';
import { AccessibleIcon } from './AccessibleIcon';

interface EmailPreviewHeaderProps {
  email: Email;
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export function EmailPreviewHeader({
  email,
  setSelected,
}: EmailPreviewHeaderProps) {
  const submit = useSubmit();
  const [, setSearchParams] = useSearchParams();

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
        {format(email.createdAt, 'cccc, do MMMM yyyy @ hh:mm a')}
      </h3>
      <Form method="post" className="mb-4 flex gap-2">
        <input type="hidden" name="selected" value={email.id} />
        <Tooltip content="Mark as unread">
          <Button
            variant="ghost"
            size="icon"
            name="_action"
            value="markSelectedUnread"
            className="hover:bg-zinc-300"
          >
            <AccessibleIcon label="Mark as unread">
              <EnvelopeClosedIcon />
            </AccessibleIcon>
          </Button>
        </Tooltip>
        <AlertDialog
          title="Are you sure?"
          description="This action cannot be undone."
          onConfirm={() => {
            setSearchParams((params) => {
              params.delete('preview');
              return params;
            });
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
                className="hover:bg-destructive"
              >
                <AccessibleIcon label="Delete">
                  <TrashIcon />
                </AccessibleIcon>
              </Button>
            </AlertDialogTrigger>
          </Tooltip>
        </AlertDialog>
        <Tooltip content="Open in new window">
          <Link to={`/${email.userId}/${email.id}`} target="_blank">
            <Button
              type="button"
              variant="ghost"
              className="hover:bg-zinc-300"
              size="icon"
              onClick={() => {
                submit(
                  { emailId: email.id, _action: 'markRead' },
                  { method: 'post' }
                );
              }}
            >
              <AccessibleIcon label="Open in new window">
                <ExternalLinkIcon />
              </AccessibleIcon>
            </Button>
          </Link>
        </Tooltip>
        <HarvestLinks email={email} />
      </Form>
      <Separator />
    </div>
  );
}
