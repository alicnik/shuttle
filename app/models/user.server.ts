import { db } from "db";

export const getUser = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      id: username,
    },
    include: {
      emails: true,
    },
  });

  return user;
};

export const createUser = async (username: string) => {
  const user = await db.user.create({
    data: {
      id: username,
    },
    include: {
      emails: true,
    },
  });

  return user;
};
