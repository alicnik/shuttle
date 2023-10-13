import { createUser, getUser } from '~/models/user.server';
import { db } from '../../../db';

vi.mock('../../../db', () => ({
  db: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('User', () => {
  it('makes the expected database query when calling getUser', async () => {
    await getUser('mock-username');

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'mock-username',
      },
      include: {
        emails: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  });

  it('makes the expected database query when calling createUser', async () => {
    await createUser('mock-username');

    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        id: 'mock-username',
      },
      include: {
        emails: true,
      },
    });
  });

  it('handles an error in user creation', async () => {
    vi.mocked(db.user.create).mockImplementationOnce(() => {
      throw new Error('oops');
    });

    const result = await createUser('mock-username');

    expect(console.error).toHaveBeenCalledWith(new Error('oops'));
    expect(result).toBeNull();
  });
});
