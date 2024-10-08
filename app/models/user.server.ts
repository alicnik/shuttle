import { db } from 'db';

export const getUser = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      id: username,
    },
    include: {
      emails: {
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return user;
};

export const createUser = async (username: string) => {
  try {
    const user = await db.user.create({
      data: {
        id: username,
      },
      include: {
        emails: true,
      },
    });

    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};
