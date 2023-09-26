import * as React from 'react';
import { Form, Link, useSearchParams, useSubmit } from '@remix-run/react';
import { format } from 'date-fns';
import { Tooltip } from './Tooltip';
import { Button, Separator } from './ui';
import type { Email, User } from '@prisma/client';
import {
  EnvelopeClosedIcon,
  ExternalLinkIcon,
  Link2Icon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { AlertDialog } from './AlertDialog';
import { AlertDialogTrigger } from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { LINK_COPY_SUCCESS_MESSAGE } from '~/lib';
import { useToast } from './ui/use-toast';

interface EmailPreviewHeaderProps {
  email: Email;
  userId: User['id'];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export function EmailPreviewHeader({
  email,
  userId,
  setSelected,
}: EmailPreviewHeaderProps) {
  const { toast } = useToast();
  const submit = useSubmit();
  const [, setSearchParams] = useSearchParams();

  const links = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(email.html, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));
    return links;
  }, [email.html]);

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

        <Dialog>
          <Tooltip content="Harvest links">
            <DialogTrigger>
              <Button variant="ghost" type="button" size="icon">
                <Link2Icon />
              </Button>
            </DialogTrigger>
          </Tooltip>
          <DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Found the following links in the email</DialogTitle>
              <DialogDescription>
                Click a link to copy it to your clipboard
              </DialogDescription>
              {links.length > 0 ? (
                <div className="grid auto-rows-fr grid-cols-2 grid-rows-6 place-items-center gap-4 pt-8">
                  {links.map((link) => {
                    return (
                      <Tooltip
                        key={link.href}
                        content={link.href}
                        sideOffset={4}
                      >
                        <div
                          className="cursor-pointer text-center"
                          dangerouslySetInnerHTML={{
                            __html: link.innerHTML,
                          }}
                          onClick={async () => {
                            await navigator.clipboard.writeText(link.href);
                            toast({
                              description: LINK_COPY_SUCCESS_MESSAGE,
                            });
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              ) : (
                <DialogDescription>
                  No links were found in the email
                </DialogDescription>
              )}
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Form>
      <Separator />
    </div>
  );
}
