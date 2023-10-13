import { setup } from '../test-utils';
import { CopyToClipboard, Toaster } from '~/components';
import { screen } from '@testing-library/react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <Toaster />
  </>
);

const props = {
  copyText: 'mock-copy-text',
  successMessage: 'mock-success-message',
  tooltipOptions: {
    content: 'mock-content',
    side: 'top',
    sideOffset: 0,
  },
} as const;

describe('CopyToClipboard', () => {
  it('should copy the text to the clipboard when the icon is clicked', async () => {
    const { user } = setup(<CopyToClipboard {...props} />, { wrapper });

    vi.spyOn(navigator.clipboard, 'writeText');

    await user.click(screen.getByTestId('clipboard-copy-icon'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(props.copyText);
  });

  it('should show the success message when the icon is clicked', async () => {
    const { user } = setup(<CopyToClipboard {...props} />, { wrapper });

    await user.click(screen.getByTestId('clipboard-copy-icon'));

    expect(screen.getByText(props.successMessage)).toBeInTheDocument();
  });
});
