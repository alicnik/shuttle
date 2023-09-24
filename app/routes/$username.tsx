import * as React from 'react';
import {
  Form,
  useLoaderData,
  useNavigation,
  useRevalidator,
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
  AlertDialog,
  EmailCard,
  EmailPreviewBody,
  EmailPreviewHeader,
  Tooltip,
} from '~/components';
import {
  EnvelopeClosedIcon,
  TrashIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import {
  deleteEmails,
  markEmailsAsRead,
  markEmailsAsUnread,
} from '~/models/email.server';
import { AlertDialogTrigger } from '~/components/ui/alert-dialog';
import clsx from 'clsx';

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
  switch (action) {
    case 'markRead': {
      const emailId = String(formData.get('emailId'));
      await markEmailsAsRead(emailId);
      return new Response(null, { status: 200 });
    }
    case 'markUnread': {
      const emailId = String(formData.get('emailId'));
      await markEmailsAsUnread(emailId);
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
  const [isRevalidating, setIsRevalidating] = React.useState(false);

  const [searchTerm, setSearchTerm] = React.useState('');
  const { user } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  React.useEffect(() => {
    const intervalId = setInterval(revalidator.revalidate, 30000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (revalidator.state === 'idle') {
      return;
    }

    let timeoutId: NodeJS.Timeout;
    if (revalidator.state === 'loading') {
      setIsRevalidating(true);
      timeoutId = setTimeout(() => {
        setIsRevalidating(false);
      }, 1500);
    }
    return () => {
      if (revalidator.state === 'idle') {
        clearTimeout(timeoutId);
      }
    };
  }, [revalidator.state]);

  React.useEffect(() => {
    const revalideOnFocus = () => revalidator.revalidate();
    window.addEventListener('focus', revalideOnFocus);
    return () => window.removeEventListener('focus', revalideOnFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="flex h-full w-full gap-6 rounded-md p-4">
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
                <AlertDialog
                  title="Are you sure?"
                  description="This action cannot be undone."
                  onConfirm={() => {
                    setSelected([]);
                    setPreview(
                      preview && selected.includes(preview) ? null : preview
                    );
                    submit(
                      {
                        _action: 'deleteSelected',
                        selected: selected.join(','),
                      },
                      { method: 'post' }
                    );
                  }}
                >
                  <Tooltip content="Delete">
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        name="_action"
                        value="deleteSelected"
                        variant="outline"
                        className="hover:bg-destructive focus:bg-destructive"
                        size="icon"
                      >
                        <TrashIcon />
                      </Button>
                    </AlertDialogTrigger>
                  </Tooltip>
                </AlertDialog>
                <Tooltip content="Check for new emails">
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => {
                      revalidator.revalidate();
                    }}
                  >
                    <UpdateIcon
                      className={clsx(isRevalidating && 'animate-spin')}
                    />
                  </Button>
                </Tooltip>
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
              setPreview={setPreview}
              setSelected={setSelected}
            />
          ) : null}
          <EmailPreviewBody html={previewEmail?.html} />
        </div>
      </div>
    </>
  );
}
