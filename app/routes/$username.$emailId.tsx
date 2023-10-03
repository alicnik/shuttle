import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { getEmail } from '~/models/email.server';
import { syncSession } from '~/lib/session.server';
import type { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { username, emailId } = params;

  invariant(emailId, 'Email ID is required');

  const email = await getEmail(emailId);

  if (!email) {
    return redirect(`/${username}`, {
      headers: {
        'Set-Cookie': await syncSession(request),
      },
    });
  }

  return new Response(email.html, {
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': await syncSession(request),
    },
  });
};
