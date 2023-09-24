import { db } from 'db';

export const getEmail = async (id: string) => {
  const email = await db.email.findUnique({
    where: { id },
  });

  return email;
};

export const deleteEmails = async (ids: string | string[]) => {
  const idArray = Array.isArray(ids) ? ids : [ids];
  const emails = await db.email.deleteMany({
    where: { id: { in: idArray } },
  });

  return emails;
};

export const markEmailsAsRead = async (ids: string | string[]) => {
  const idArray = Array.isArray(ids) ? ids : [ids];

  const email = await db.email.updateMany({
    where: { id: { in: idArray } },
    data: { read: true },
  });

  return email;
};

export const markEmailsAsUnread = async (ids: string | string[]) => {
  const idArray = Array.isArray(ids) ? ids : [ids];

  const emails = await db.email.updateMany({
    where: { id: { in: idArray } },
    data: { read: false },
  });

  return emails;
};
