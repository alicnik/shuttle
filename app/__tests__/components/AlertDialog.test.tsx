import { screen } from '@testing-library/react';
import { setup } from '../test-utils';
import { AlertDialog, AlertDialogTrigger } from '~/components';

const props = {
  title: 'mock-title',
  description: 'mock-description',
  onConfirm: vi.fn(),
};

describe('AlertDialog', () => {
  it('should open the dialog and render the expected content when the AlertDialogTrigger is clicked', async () => {
    const { container, user } = setup(
      <AlertDialog {...props}>
        <AlertDialogTrigger asChild>
          <button>Open dialog</button>
        </AlertDialogTrigger>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    expect(container).toMatchSnapshot();
  });

  it('should call the onConfirm callback when the continue button is clicked', async () => {
    const { user } = setup(
      <AlertDialog {...props}>
        <AlertDialogTrigger asChild>
          <button>Open dialog</button>
        </AlertDialogTrigger>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(props.onConfirm).toHaveBeenCalled();
  });

  it('should close the dialog when the cancel button is clicked', async () => {
    const { user } = setup(
      <AlertDialog {...props}>
        <AlertDialogTrigger asChild>
          <button>Open dialog</button>
        </AlertDialogTrigger>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
