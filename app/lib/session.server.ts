import type { Session } from '@remix-run/node';
import { createCookieSessionStorage } from '@remix-run/node';
import { logger } from './logger.server';

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

const getTodaysInboxes = (session: Session) => {
  const currentInboxes: SessionInbox[] = session.get('inboxes') || [];
  return currentInboxes.filter(
    (inbox) => inbox.date === new Date().toISOString().slice(0, 10)
  );
};

export const syncSession = async (request: Request, username?: string) => {
  const session = await getShuttleSession(request);
  const todaysInboxes = getTodaysInboxes(session);

  if (username && !todaysInboxes.find((inbox) => inbox.username === username)) {
    todaysInboxes.push({
      username,
      date: new Date().toISOString().slice(0, 10),
    });
  }

  try {
    if (JSON.stringify(todaysInboxes.length > 4000)) {
      logger.error('Session too large', { data: todaysInboxes });
    }
  } catch (error) {
    logger.error('Error checking session size', { error });
  }

  session.set('inboxes', todaysInboxes);

  return commitSession(session);
};

export const getInboxes = async (request: Request) => {
  const session = await getShuttleSession(request);
  return getTodaysInboxes(session);
};
