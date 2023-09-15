import type { Handler } from '@netlify/functions';
import { schedule } from '@netlify/functions';
import { db } from '../../lib/db';

const myHandler: Handler = async () => {
  await db.user.deleteMany();
  await db.email.deleteMany({
    where: {
      userId: null,
    },
  });

  return {
    statusCode: 204,
  };
};

const handler = schedule('@daily', myHandler);

export { handler };
