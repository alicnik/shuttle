import { db } from 'db';

export const getEmail = async (id: string) => {
  const email = await db.email.findUnique({
    where: { id },
  });

  return email;
};

export const deleteEmail = async (id: string) => {
  const email = await db.email.delete({
    where: { id },
  });

  return email;
};
