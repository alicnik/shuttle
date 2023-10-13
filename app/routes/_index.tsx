import * as React from 'react';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Button, CopyToClipboard, Input } from '~/components';
import { createUser } from '~/models/user.server';
import { getInboxes, syncSession } from '~/lib/session.server';
import { EMAIL_ADRESS_COPY_SUCCESS_MESSAGE } from '~/lib';
import { generateRandomName } from '~/lib/generate-random-name.server';
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { AccessibleIcon } from '@radix-ui/react-accessible-icon';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const inboxes = await getInboxes(request);

  return json(
    { inboxes },
    {
      headers: {
        'Set-Cookie': await syncSession(request),
      },
    }
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get('_action');

  const jsonData = {
    errors: null,
    randomName: null,
  };

  if (action === 'random') {
    return json({ ...jsonData, randomName: generateRandomName() });
  }

  const username = formData.get('username');
  invariant(typeof username === 'string', 'username must be a string');

  if (!username) {
    return json(
      { ...jsonData, errors: 'Username cannot be empty.' },
      { status: 400 }
    );
  }

  const user = await createUser(username);
  if (!user) {
    return json(
      { ...jsonData, errors: 'Username already taken.' },
      {
        headers: {
          'Set-Cookie': await syncSession(request),
        },
        status: 400,
      }
    );
  }

  return redirect(`/${user.id}`, {
    headers: {
      'Set-Cookie': await syncSession(request, user.id),
    },
  });
};

export const meta: MetaFunction = () => [
  {
    title: 'Shuttle',
  },
  {
    name: 'description',
    content: 'A temporary email service that minimises the back and forth.',
  },
];

export const links: LinksFunction = () => [
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap',
  },
];

export default function Index() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [isAnimating, setIsAnimating] = React.useState(false);
  const isCreating = navigation.formData?.get('_action') === 'create';
  const isRandomising = navigation.formData?.get('_action') === 'random';

  return (
    <div className="container mx-auto flex flex-col items-center">
      <h1 className="mb-2 mt-8 font-display text-6xl font-bold md:mt-16 md:text-8xl">
        Shuttle
      </h1>
      <p className="text-center text-lg">
        A temporary email service that minimises the back and forth
      </p>
      <img
        height={150}
        width={150}
        className={clsx(
          'shuttle-logo cursor-pointer invert dark:invert-0',
          isAnimating
            ? 'shuttle-logo-animation'
            : 'animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]'
        )}
        src="/assets/shuttle.png"
        alt="Shuttle Logo"
        onClick={() => {
          setIsAnimating(true);
          setTimeout(() => {
            setIsAnimating(false);
          }, 1250);
        }}
      />
      <Form
        method="post"
        className="relative -top-8 mb-4 w-full max-w-sm md:mb-8"
      >
        <p className="mb-4 w-full text-center">
          Create an inbox. It will be deleted at midnight.
        </p>
        <Input
          type="text"
          placeholder="Email"
          append="@shuttle.email"
          name="username"
          className="mb-2"
          defaultValue={
            actionData?.errors
              ? ''
              : actionData?.randomName
              ? actionData?.randomName
              : undefined
          }
        />
        {actionData?.errors ? (
          <p role="alert" className="mb-2 ml-2 text-xs text-red-500">
            {actionData?.errors}
          </p>
        ) : (
          <>&nbsp;</>
        )}
        <div className="flex justify-center gap-4">
          <Button
            type="submit"
            name="_action"
            value="random"
            className="w-24"
            disabled={isRandomising}
          >
            {isRandomising ? (
              <AccessibleIcon label="Generating a random name">
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              </AccessibleIcon>
            ) : (
              'Random'
            )}
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
            className="w-24"
            name="_action"
            value="create"
          >
            {isCreating ? (
              <AccessibleIcon label="Creating your inbox">
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              </AccessibleIcon>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </Form>

      {loaderData.inboxes?.length ? (
        <div className="relative -top-8 flex flex-col md:flex-row md:justify-center md:gap-12">
          <h2 className="mb-2 text-center text-2xl font-bold">Your Inboxes</h2>
          <ul className="flex flex-col space-y-2 pt-2">
            {loaderData?.inboxes?.map(({ username }) => (
              <li
                key={username}
                className="flex justify-between gap-2 md:justify-normal"
              >
                <Link
                  to={`/${username}`}
                  className="max-w-[190px] truncate text-sm underline md:max-w-[230px]"
                >
                  {username}@shuttle.email
                </Link>
                <CopyToClipboard
                  copyText={`${username}@shuttle.email`}
                  successMessage={EMAIL_ADRESS_COPY_SUCCESS_MESSAGE}
                  tooltipOptions={{
                    content: 'Copy email address',
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
