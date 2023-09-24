import { ReloadIcon } from '@radix-ui/react-icons';
import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import clsx from 'clsx';
import * as React from 'react';
import invariant from 'tiny-invariant';
import { Button, Input } from '~/components/ui';
import { createUser } from '~/models/user.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const username = formData.get('username');
  invariant(typeof username === 'string', 'username must be a string');
  const user = await createUser(username);
  if (!user) {
    return json({ errors: 'Username already taken.' }, { status: 400 });
  }
  return redirect(`/${user.id}`);
};

export default function Index() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const [isAnimating, setIsAnimating] = React.useState(false);

  const isSubmitting = ['submitting', 'loading'].includes(navigation.state);

  return (
    <div className="flex flex-col items-center">
      <h1 className="mt-16 text-8xl font-bold">Shuttle</h1>
      <p className="text-lg">
        A temporary email service that minimises back and forth
      </p>
      <img
        width={150}
        className={clsx(
          'shuttle-logo cursor-pointer',
          isAnimating && 'shuttle-logo-animation'
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
      <Form method="post" className="w-full max-w-md">
        <div className="mb-1 flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Email"
            append="@shuttle.email"
            name="username"
            defaultValue={actionData?.errors ? '' : undefined}
          />
          <Button type="submit" className="w-24" disabled={isSubmitting}>
            {isSubmitting ? (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Create'
            )}
          </Button>
        </div>
        {actionData?.errors && (
          <p role="alert" className="ml-2 text-xs text-red-500">
            {actionData?.errors}
          </p>
        )}
      </Form>
    </div>
  );
}
