import * as React from 'react';
import {
  Form,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import invariant from 'tiny-invariant';
import { createUser, getUser } from '~/models/user.server';
import { json } from '@remix-run/node';
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
import {
  deleteEmails,
  markEmailsAsRead,
  markEmailsAsUnread,
} from '~/models/email.server';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { username } = params;
  invariant(username, 'Username is required');
  let user = await getUser(username);

  if (!user) {
    user = await createUser(username);
  }

  invariant(user, 'User must exist');
  return json({ user });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get('_action');
  console.log({ action });
  switch (action) {
    case 'markRead': {
      const emailId = String(formData.get('emailId'));
      await markEmailsAsRead(emailId);
      return new Response(null, { status: 200 });
    }
    case 'markSelectedUnread': {
      const emailIds = String(formData.get('selected'));
      const emailIdsArray = emailIds.split(',');
      await markEmailsAsUnread(emailIdsArray);
      return new Response(null, { status: 200 });
    }
    case 'deleteSelected': {
      const emailIds = String(formData.get('selected'));
      const emailIdsArray = emailIds.split(',');
      await deleteEmails(emailIdsArray);
      return new Response(null, { status: 200 });
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
  const submit = useSubmit();
  const navigation = useNavigation();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [preview, setPreview] = React.useState<string | null>(null);

  const [searchTerm, setSearchTerm] = React.useState('');
  const { user } = useLoaderData<typeof loader>();

  const emailsBeingDeleted = React.useMemo(() => {
    const isInFlight = ['submitting', 'loading'].includes(navigation.state);
    if (!isInFlight) {
      return [];
    }

    const formData = navigation.formData;
    if (!formData) {
      return [];
    }

    const action = formData.get('_action');
    if (action !== 'deleteSelected') {
      return [];
    }

    const selected = String(formData.get('selected')).split(',');
    return selected;
  }, [navigation]);

  const emailsToDisplay = user.emails
    .filter(({ id }) => !emailsBeingDeleted.includes(id))
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
          <div className="mb-8 flex items-baseline justify-between">
            <h1 className=" text-3xl font-bold">Inbox</h1>
            <span className="text-sm">{user.id}@shuttle.email</span>
          </div>
          <Input
            className="mb-6"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {emailsToDisplay.length ? (
            <Form method="post">
              <input type="hidden" name="selected" value={selected.join(',')} />
              <div className="mb-6 flex gap-4">
                <Checkbox
                  className="ml-2 mr-2 mt-[10px]"
                  checked={emailsToDisplay.every(({ id }) =>
                    selected.includes(id)
                  )}
                  onCheckedChange={() => {
                    setSelected((selected) => {
                      if (selected.length === emailsToDisplay.length) {
                        if (preview) {
                          setPreview(null);
                        }
                        return [];
                      }
                      return emailsToDisplay.map(({ id }) => id);
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
                <AlertDialog>
                  <Tooltip content="Delete">
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        name="_action"
                        value="deleteSelected"
                        variant="outline"
                        className="hover:bg-destructive"
                        size="icon"
                      >
                        <TrashIcon />
                      </Button>
                    </AlertDialogTrigger>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setSelected([]);
                          setPreview(null);
                          submit(
                            {
                              _action: 'deleteSelected',
                              selected: selected.join(','),
                            },
                            { method: 'post' }
                          );
                        }}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {emailsToDisplay.map((email, index) => {
                return (
                  <React.Fragment key={email.id}>
                    <EmailCard
                      email={email}
                      selected={selected}
                      setSelected={setSelected}
                      preview={preview}
                      setPreview={setPreview}
                    />
                    {index !== emailsToDisplay.length - 1 && (
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
