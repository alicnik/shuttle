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

    vi.spyOn(navigator.clipboard, 'write');

    await user.click(screen.getByTestId('clipboard-copy-icon'));

    const blob = new Blob([props.copyText], { type: 'text/plain' });
    const item = new ClipboardItem({ 'text/plain': blob });
    expect(navigator.clipboard.write).toHaveBeenCalledWith([item]);
  });

  it('should show the success message when the icon is clicked', async () => {
    const { user } = setup(<CopyToClipboard {...props} />, { wrapper });

    await user.click(screen.getByTestId('clipboard-copy-icon'));

    expect(screen.getByText(props.successMessage)).toBeInTheDocument();
  });
});
