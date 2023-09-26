import { createCookieSessionStorage } from '@remix-run/node';

if (!process.env.SESSION_SECRET) {
  throw new Error('Session secret not defined');
}

const { getSession, commitSession } = createCookieSessionStorage<{
  inboxes: SessionInbox[];
}>({
  cookie: {
    name: '__shuttle_inboxes',
    secrets: [process.env.SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
  },
});

export type SessionInbox = {
  username: string;
  date: string;
};

const getShuttleSession = async (request: Request) => {
  const session = await getSession(request.headers.get('Cookie'));
  return session;
};

export const syncSession = async (request: Request, username?: string) => {
  const session = await getShuttleSession(request);

  const currentInboxes: SessionInbox[] = session.get('inboxes') || [];
  const todaysInboxes = currentInboxes.filter(
    (inbox) => inbox.date === new Date().toISOString().slice(0, 10)
  );

  if (username && !todaysInboxes.find((inbox) => inbox.username === username)) {
    todaysInboxes.push({
      username,
      date: new Date().toISOString().slice(0, 10),
    });
  }

  session.set('inboxes', todaysInboxes);

  return commitSession(session);
};

export const getInboxes = async (request: Request) => {
  const session = await getShuttleSession(request);
  return session.get('inboxes');
};
