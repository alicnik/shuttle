import type { Email } from '@prisma/client';
import {
  CaretSortIcon,
  CodeIcon,
  DotsHorizontalIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, Outlet, useFetcher, useLoaderData } from '@remix-run/react';
import type { ColumnDef } from '@tanstack/react-table';
import { formatRelative } from 'date-fns';
import invariant from 'tiny-invariant';
import { Inbox } from '~/components';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { deleteEmail } from '~/models/email.server';
import { createUser, getUser } from '~/models/user.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { username } = params;
  invariant(username, 'Username is required');
  let user = await getUser(username);

  if (!user) {
    user = await createUser(username);
  }

  return user;
};

export const action = () => {
  console.log('ACTION');
};

export const meta: MetaFunction<typeof loader> = ({ params, data }) => {
  const { username } = params;
  const { emails } = data || {};
  const unreadEmails = emails?.filter((email) => !email.read);
  const inboxTitleSegment = unreadEmails?.length
    ? `Inbox (${unreadEmails.length})`
    : 'Inbox';
  return [{ title: `${inboxTitleSegment} - ${username}@shuttle.email` }];
};

export default function UserInbox() {
  const user = useLoaderData<typeof loader>();

  return (
    <>
      <div className="mt-4 flex h-5/6 w-full gap-4 rounded-md bg-slate-700 p-4">
        <div className="rounded-md">
          <h1 className="mb-4 text-3xl font-bold">Inbox</h1>
          {user.emails.map((email) => {
            return (
              <div key={email.id} className="pointer-cursor mb-2 ">
                <div className="flex items-center">
                  <p className="mr-12 text-sm font-bold">{email.from}</p>
                  <p className="ml-auto text-xs">
                    {formatRelative(new Date(email.createdAt), new Date())}
                  </p>
                </div>
                <p className="text-xs">{email.subject}</p>
              </div>
            );
          })}
        </div>
        <div className="flex-1 rounded-md bg-slate-300">
          <Outlet />
        </div>
      </div>
    </>
  );
}
