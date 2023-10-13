import { createMockFormData, setupRemixStub } from '../test-utils';
import Homepage, { action, links, loader, meta } from '../../routes/_index';
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { act, screen } from '@testing-library/react';
import { createUser } from '~/models/user.server';
import { getInboxes, syncSession } from '~/lib/session.server';

vi.mock('~/lib/session.server');
vi.mock('~/models/user.server');
vi.mock('~/lib/generate-random-name.server', () => ({
  generateRandomName: () => 'mock-random-name',
}));
vi.mock('../../../db', () => ({ db: {} }));

describe('homepage', () => {
  beforeEach(async () => {
    const loaderData = await loader(fromPartial({}));
    vi.mocked(useLoaderData<typeof loader>).mockReturnValue(
      await loaderData.json()
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the expected meta data', () => {
    const metaData = meta(fromPartial({}));

    expect(metaData).toEqual([
      { title: 'Shuttle' },
      {
        name: 'description',
        content: 'A temporary email service that minimises the back and forth.',
      },
    ]);
  });

  it('renders the expected links', () => {
    const linksData = links();

    expect(linksData).toEqual([
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap',
      },
    ]);
  });

  it('should match the snapshot', () => {
    const { container } = setupRemixStub(<Homepage />);

    expect(container).toMatchSnapshot();
  });

  it("animates the shuttle logo when it's clicked", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { user } = setupRemixStub(<Homepage />, {
      userOptions: {
        advanceTimers: vi.advanceTimersByTime,
      },
    });

    const image = screen.getByRole('img');

    await user.click(image);

    expect(image).toHaveClass('shuttle-logo-animation');

    act(() => vi.advanceTimersByTime(1250));

    expect(image).not.toHaveClass('shuttle-logo-animation');

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should render the input with an empty default value on first mount', () => {
    setupRemixStub(<Homepage />);

    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('');
  });

  it('renders the input with a default value if a random name has been generated', async () => {
    const actionData = await action(
      fromPartial({
        request: {
          formData: async () => createMockFormData({ _action: 'random' }),
        },
      })
    );

    vi.mocked(useActionData<typeof action>).mockReturnValue(
      await actionData.json()
    );

    setupRemixStub(<Homepage />);

    expect(screen.getByRole('textbox')).toHaveValue('mock-random-name');
  });

  it('renders an error if the username is empty', async () => {
    vi.mocked(createUser).mockResolvedValue(null);

    const actionData = await action(
      fromPartial({
        request: {
          formData: async () => createMockFormData({ username: '' }),
        },
      })
    );
    vi.mocked(useActionData<typeof action>).mockReturnValue(
      await actionData.json()
    );

    setupRemixStub(<Homepage />);

    const error = screen.getByRole('alert');

    expect(error).toHaveTextContent(/username cannot be empty/i);
  });

  it('renders an error if the username is already taken', async () => {
    vi.mocked(createUser).mockResolvedValue(null);

    const actionData = await action(
      fromPartial({
        request: {
          formData: async () =>
            createMockFormData({ username: 'mock-username' }),
        },
      })
    );
    vi.mocked(useActionData<typeof action>).mockReturnValue(
      await actionData.json()
    );

    setupRemixStub(<Homepage />);

    const error = screen.getByRole('alert');

    expect(error).toHaveTextContent(/username already taken/i);
  });

  it('redirects to the user inbox upon creation', async () => {
    vi.mocked(syncSession).mockResolvedValue('mock-cookie');
    vi.mocked(createUser).mockResolvedValue(fromPartial({ id: 'mock-id' }));

    const response = await action(
      fromPartial({
        request: {
          formData: async () => createMockFormData({ username: 'mock-id' }),
        },
      })
    );

    const expectedHeaders = new Headers();
    expectedHeaders.append('location', '/mock-id');
    expectedHeaders.append('set-cookie', 'mock-cookie');

    expect(response.status).toBe(302);
    expect(response.headers).toEqual(expectedHeaders);
  });

  it.each([
    { name: 'random', text: /generating a random name/i },
    { name: 'create', text: /creating your inbox/i },
  ])(
    'shows a loading icon and disables the $name button on click',
    async ({ name, text }) => {
      vi.mocked(useNavigation).mockReturnValue(
        fromPartial({
          formData: createMockFormData({ _action: name }),
        })
      );

      const { container } = setupRemixStub(<Homepage />);

      expect(container).toMatchSnapshot();
      expect(screen.getByText(text).parentElement).toBeDisabled();
    }
  );

  it('displays any inboxes that are stored in the cookie session', async () => {
    vi.mocked(getInboxes).mockResolvedValue([
      { username: 'mock-inbox-name', date: new Date().toISOString() },
    ]);
    const loaderData = await loader(fromPartial({}));
    vi.mocked(useLoaderData<typeof loader>).mockReturnValue(
      await loaderData.json()
    );

    setupRemixStub(<Homepage />);

    const inbox = screen.getByRole('link');

    expect(inbox).toHaveTextContent('mock-inbox-name@shuttle.email');
  });
});
