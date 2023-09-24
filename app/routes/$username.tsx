import * as React from 'react';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { createUser, getUser } from '~/models/user.server';
import { redirect } from '@remix-run/node';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { Input, Separator, Button, Checkbox } from '~/components/ui';
import {
  EmailCard,
  Tooltip,
  EmailPreviewBody,
  EmailPreviewHeader,
} from '~/components';
import { EnvelopeClosedIcon, TrashIcon } from '@radix-ui/react-icons';
import { markEmailsAsRead, markEmailsAsUnread } from '~/models/email.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { username } = params;
  invariant(username, 'Username is required');
  let user = await getUser(username);

  if (!user) {
    user = await createUser(username);
  }

  return { user };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get('_action');

  switch (action) {
    case 'markRead': {
      const emailId = String(formData.get('emailId'));
      await markEmailsAsRead(emailId);
      return redirect(request.url, { status: 303 });
    }
    case 'markSelectedUnread': {
      const emailIds = String(formData.get('selected'));
      const emailIdsArray = emailIds.split(',');
      await markEmailsAsUnread(emailIdsArray);
      return redirect(request.url, { status: 303 });
    }
    default:
      return null;
  }
};

export const meta: MetaFunction<typeof loader> = ({ params, data }) => {
  const { username } = params;
  const { emails } = data?.user || {};
  const unreadEmails = emails?.filter((email) => !email.read);
  const inboxTitleSegment = unreadEmails?.length
    ? `Inbox (${unreadEmails.length})`
    : 'Inbox';
  return [{ title: `${inboxTitleSegment} - ${username}@shuttle.email` }];
};

export default function UserInbox() {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [preview, setPreview] = React.useState<string | null>(null);

  const [searchTerm, setSearchTerm] = React.useState('');
  const { user } = useLoaderData<typeof loader>();

  const emails = user.emails
    .filter(
      ({ subject, text }) =>
        subject?.toLowerCase().includes(searchTerm) ||
        text.toLowerCase().includes(searchTerm)
    )
    .map((email) => ({ ...email, createdAt: new Date(email.createdAt) }));

  const previewEmail = user.emails.find(({ id }) => id === preview);

  return (
    <>
      <div className="flex h-5/6 w-full gap-6 rounded-md p-4">
        <div className="w-96 rounded-md">
          <h1 className="mb-8 text-3xl font-bold">Inbox</h1>
          <Input
            className="mb-6"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {emails.length ? (
            <Form method="post">
              <input type="hidden" name="selected" value={selected.join(',')} />
              <div className="mb-6 flex gap-4">
                <Checkbox
                  className="ml-2 mr-2 mt-[10px]"
                  checked={emails.every(({ id }) => selected.includes(id))}
                  onCheckedChange={() => {
                    setSelected((selected) => {
                      if (selected.length === emails.length) {
                        if (preview) {
                          setPreview(null);
                        }
                        return [];
                      }
                      return emails.map(({ id }) => id);
                    });
                  }}
                />
                <Tooltip content="Mark as unread">
                  <Button
                    variant="outline"
                    size="icon"
                    name="_action"
                    value="markSelectedUnread"
                  >
                    <EnvelopeClosedIcon />
                  </Button>
                </Tooltip>
                <Tooltip content="Delete">
                  <Button
                    name="_action"
                    value="deleteSelected"
                    variant="outline"
                    size="icon"
                  >
                    <TrashIcon />
                  </Button>
                </Tooltip>
              </div>
              {emails.map((email, index) => {
                return (
                  <React.Fragment key={email.id}>
                    <EmailCard
                      email={email}
                      selected={selected}
                      setSelected={setSelected}
                      preview={preview}
                      setPreview={setPreview}
                    />
                    {index !== emails.length - 1 && (
                      <Separator className="mb-4" />
                    )}
                  </React.Fragment>
                );
              })}
            </Form>
          ) : (
            <p className="text-sm italic">
              {searchTerm ? `No results...` : 'No emails in here...'}
            </p>
          )}
        </div>
        <div className="flex-1 rounded-md bg-zinc-200">
          {previewEmail ? (
            <EmailPreviewHeader
              email={{
                ...previewEmail,
                createdAt: new Date(previewEmail.createdAt),
              }}
              userId={user.id}
            />
          ) : null}
          <EmailPreviewBody html={previewEmail?.html} />
        </div>
      </div>
    </>
  );
}
