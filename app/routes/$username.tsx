import type { Email } from '@prisma/client';
import { Checkbox } from '~/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu';
import {
  CaretSortIcon,
  DotsHorizontalIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { ColumnDef } from '@tanstack/react-table';
import invariant from 'tiny-invariant';
import { Inbox } from '~/components';
import { Button } from '~/components/ui/button';
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

export const meta: MetaFunction<typeof loader> = ({ params, data }) => {
  const { username } = params;
  const { emails } = data || {};
  const unreadEmails = emails?.filter((email) => !email.read);
  const inboxTitleSegment = unreadEmails?.length
    ? `Inbox (${unreadEmails.length})`
    : 'Inbox';
  return [{ title: `${inboxTitleSegment} - ${username}@shuttle.email` }];
};

const columns: ColumnDef<Email>[] = [
  {
    id: 'select',
    size: 25,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'from',
    size: 200,
    header: ({ column }) => {
      return (
        <span
          className="flex w-32 cursor-pointer items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          From
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </span>
      );
    },
    cell: ({ row }) => {
      const { id: emailId, userId } = row.original;

      return (
        <Link to={`/${userId}/${emailId}`} reloadDocument>
          <span className="lowercase">{row.getValue('from')}</span>
        </Link>
      );
    },
  },
  {
    accessorKey: 'subject',
    size: 600,
    header: ({ column }) => {
      return (
        <span
          className="flex cursor-pointer items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Subject
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </span>
      );
    },
    cell: ({ row }) => {
      const { id: emailId, userId } = row.original;

      return (
        <Link to={`/${userId}/${emailId}`} reloadDocument>
          <span>{row.getValue('subject')}</span>
        </Link>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    minSize: 100,
    header: ({ column }) => {
      return (
        <span
          className="flex cursor-pointer items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Received
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </span>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt');

      if (!(date instanceof Date)) {
        throw new Error('Invalid date');
      }

      return (
        <div>
          {date.toLocaleDateString('en-GB', {
            hour: 'numeric',
            minute: 'numeric',
          })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    size: 20,
    enableHiding: false,
    cell: ({ row }) => {
      const { userId, id } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900">
            <DropdownMenuLabel>View</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link to={`/${userId}/${id}`} reloadDocument>
                As HTML
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-auto bg-white" />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-red-800"
              onClick={() => deleteEmail(id)}
            >
              <TrashIcon className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function UserInbox() {
  const user = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Inbox</h1>
      <Inbox
        data={user.emails.map((email) => ({
          ...email,
          createdAt: new Date(email.createdAt),
        }))}
        columns={columns}
      />
    </>
  );
}
