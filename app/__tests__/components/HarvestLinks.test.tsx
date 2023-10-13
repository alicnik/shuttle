import { screen } from '@testing-library/react';
import { setup } from '../test-utils';
import { HarvestLinks, Toaster } from '~/components';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <Toaster />
  </>
);

const props = {
  email: {
    id: 'mock-id',
    subject: 'mock-subject',
    from: 'mock-from',
    text: 'mock-text',
    html: `
    <html>
      <head></head>
      <body>
        <a href="https://shuttle.email">Shuttle</a>
        <a href="https://mock-href.com">
          <img style="padding: 10px;" width="10" height="10" src="mock-src" />
        </a>
      </body>
    </html>
    `,
    userId: 'mock-user-id',
    read: false,
    createdAt: new Date('October 13, 2023 13:07:00'),
  },
};

describe('HarvestLinks', () => {
  it('should match the snapshot if there are links', async () => {
    const { user } = setup(<HarvestLinks {...props} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('dialog')).toMatchSnapshot();
  });

  it('should match the snapshot if there are no links', async () => {
    const { user } = setup(
      <HarvestLinks email={{ ...props.email, html: '<p>No links</p>' }} />
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('dialog')).toMatchSnapshot();
  });

  it('extracts the links and formats images appropriately', async () => {
    const { user } = setup(<HarvestLinks {...props} />);

    await user.click(screen.getByRole('button'));

    const image = screen.getByRole('img');

    expect(image).not.toHaveAttribute('style', 'padding: 10px;');
    expect(image).not.toHaveAttribute('width');
    expect(image).not.toHaveAttribute('height');
    expect(image).toHaveAttribute('style', 'max-width: 80%;');
  });

  it('should allow the user to click on harvested links to copy the href to the clipboard', async () => {
    const { user } = setup(<HarvestLinks {...props} />, { wrapper });

    vi.spyOn(navigator.clipboard, 'writeText');

    await user.click(screen.getByRole('button'));
    await user.click(screen.getAllByRole('listitem')[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://shuttle.email/'
    );
    expect(screen.getByText(/link copied to clipboard/i)).toBeInTheDocument();
  });
});
