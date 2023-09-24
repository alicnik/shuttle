import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { getEmail } from '~/models/email.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { username, emailId } = params;

  invariant(emailId, 'Email ID is required');

  const email = await getEmail(emailId);

  if (!email) {
    return redirect(`/${username}`);
  }

  return new Response(email.html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
};
