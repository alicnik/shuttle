import * as React from 'react';
import {
  Form,
  Link,
  useLoaderData,
  useNavigation,
  useRevalidator,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import { createUser, getUser } from '~/models/user.server';
import { Input, Separator, Button, Checkbox } from '~/components/ui';
import {
  AlertDialog,
  CopyToClipboard,
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
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { syncSession } from '~/lib/session.server';
import { EMAIL_ADRESS_COPY_SUCCESS_MESSAGE } from '~/lib';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { username } = params;
  invariant(username, 'Username is required');
  let user = await getUser(username);

  if (!user) {
    user = await createUser(username);
  }

  invariant(user, 'User must exist');

  return json(
    { user },
    {
      headers: {
        'Set-Cookie': await syncSession(request, user.id),
      },
    }
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get('_action');
  switch (action) {
    case 'setPreview': {
      const emailId = String(formData.get('emailId'));
      const url = new URL(request.url);
      const currentPreview = url.searchParams.get('preview');
      if (currentPreview) {
        await markEmailsAsRead(currentPreview);
      }
      url.searchParams.set('preview', emailId);
      return redirect(url.href, { status: 303 });
    }
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
      const url = new URL(request.url);
      const currentPreview = url.searchParams.get('preview');
      if (currentPreview && emailIdsArray.includes(currentPreview)) {
        url.searchParams.delete('preview');
        return redirect(url.href, { status: 303 });
      }
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
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedState, setSelected] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isRevalidating, setIsRevalidating] = React.useState(false);

  const { user } = useLoaderData<typeof loader>();

  const emailsBeingDeleted =
    navigation.formData?.get('_action') === 'deleteSelected'
      ? String(navigation.formData?.get('selected')).split(',')
      : [];
  const newPreview =
    navigation.formData?.get('_action') === 'setPreview'
      ? String(navigation.formData?.get('emailId'))
      : null;

  const emailsToDisplay = user.emails
    .filter(({ id }) => !emailsBeingDeleted.includes(id))
    .filter(
      ({ subject, text }) =>
        subject?.toLowerCase().includes(searchTerm) ||
        text?.toLowerCase().includes(searchTerm)
    )
    .map((email) => ({ ...email, createdAt: new Date(email.createdAt) }));

  const preview = searchParams.get('preview');
  const previewEmail = user.emails.find(({ id }) =>
    [preview, newPreview].includes(id)
  );

  const selected = selectedState.concat(
    newPreview || searchParams.get('preview') || []
  );

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

  return (
    <>
      <div className="container mx-auto flex h-full w-full gap-6 rounded-md p-4">
        <div className="w-96 rounded-md">
          <div className="mb-8 flex items-baseline justify-between gap-3">
            <Link to="/" className="flex-1">
              <h1 className=" text-3xl font-bold">Shuttle</h1>
            </Link>
            <span className="text-sm">{user.id}@shuttle.email </span>
            <CopyToClipboard
              copyText={`${user.id}@shuttle.email`}
              successMessage={EMAIL_ADRESS_COPY_SUCCESS_MESSAGE}
              tooltipOptions={{
                content: 'Copy email address',
                side: 'bottom',
                sideOffset: 8,
              }}
            />
          </div>
          <Input
            className="mb-6"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {emailsToDisplay.length ? (
            <div className="h-full">
              <Form method="post">
                <input
                  type="hidden"
                  name="selected"
                  value={selected.join(',')}
                />
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
                            setSearchParams((params) => {
                              params.delete('preview');
                              return params;
                            });
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
                      setSearchParams((params) => {
                        if (preview && selected.includes(preview)) {
                          params.delete('preview');
                        }
                        return params;
                      });
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
                          className="hover:bg-destructive"
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
              </Form>
              <div className="email-list h-full overflow-y-auto">
                {emailsToDisplay.map((email, index) => {
                  return (
                    <React.Fragment key={email.id}>
                      <EmailCard
                        email={email}
                        selected={selected}
                        setSelected={setSelected}
                      />
                      {index !== emailsToDisplay.length - 1 && (
                        <Separator className="mb-4" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm italic">
              {searchTerm ? `No results...` : 'No emails in here...'}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-hidden rounded-md bg-zinc-200">
          {previewEmail ? (
            <EmailPreviewHeader
              email={{
                ...previewEmail,
                createdAt: new Date(previewEmail.createdAt),
              }}
              userId={user.id}
              setSelected={setSelected}
            />
          ) : null}
          <EmailPreviewBody html={previewEmail?.html} />
        </div>
      </div>
    </>
  );
}
