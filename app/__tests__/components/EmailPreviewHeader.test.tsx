import { screen } from '@testing-library/react';
import { EmailPreviewHeader } from '~/components';
import { setupRemixStub } from '../test-utils';
import { useSearchParams, useSubmit } from '@remix-run/react';

const props = {
  email: {
    id: 'mock-id',
    subject: 'mock-subject',
    from: 'mock-from',
    text: 'mock-text',
    html: 'mock-html',
    userId: 'mock-user-id',
    read: false,
    createdAt: new Date('October 13, 2023 13:07:00'),
  },
  setSelected: vi.fn(),
};

describe('EmailPreviewHeader', () => {
  it('should match the snapshot', () => {
    const { container } = setupRemixStub(<EmailPreviewHeader {...props} />);

    expect(container).toMatchSnapshot();
  });

  it('should render the email details', () => {
    setupRemixStub(<EmailPreviewHeader {...props} />);

    const from = screen.getByRole('heading', { name: /from: mock-from/i });
    const to = screen.getByRole('heading', {
      name: /to: mock-user-id@shuttle.email/i,
    });
    const subject = screen.getByRole('heading', {
      name: /subject: mock-subject/i,
    });
    const received = screen.getByRole('heading', {
      name: /received: friday, 13th october 2023 @ 01:07 pm/i,
    });

    expect(from).toHaveTextContent('From: mock-from');
    expect(to).toHaveTextContent('To: mock-user-id@shuttle.email');
    expect(subject).toHaveTextContent('Subject: mock-subject');
    expect(received).toHaveTextContent(
      'Received: Friday, 13th October 2023 @ 01:07 PM'
    );
  });

  it('should update state upon deletion and programmatically submit form values', async () => {
    const mockSearchParams = new URLSearchParams({ preview: props.email.id });
    const mockSetSearchParams = vi.fn();
    vi.mocked(useSearchParams).mockReturnValueOnce([
      mockSearchParams,
      mockSetSearchParams,
    ]);

    const mockSubmit = vi.fn();
    vi.mocked(useSubmit).mockReturnValueOnce(mockSubmit);

    const { user } = setupRemixStub(<EmailPreviewHeader {...props} />);

    await user.click(screen.getByText(/delete/i));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    const setSearchParamsCallback = mockSetSearchParams.mock.lastCall[0];
    const newSearchParams = setSearchParamsCallback(mockSearchParams);

    const setSelectedCallback = props.setSelected.mock.lastCall[0];
    const newSelected = setSelectedCallback(['existing-id', props.email.id]);

    expect(newSearchParams.get('preview')).toBeNull();
    expect(newSelected).toEqual(['existing-id']);
    expect(mockSubmit).toHaveBeenCalledWith(
      { selected: props.email.id, _action: 'deleteSelected' },
      { method: 'post' }
    );
  });

  it('should mark the email as read when clicking on the link to open the email in a new window', async () => {
    const mockSubmit = vi.fn();
    vi.mocked(useSubmit).mockReturnValueOnce(mockSubmit);

    const { user } = setupRemixStub(<EmailPreviewHeader {...props} />);

    await user.click(screen.getByText(/open in new window/i));

    expect(mockSubmit).toHaveBeenCalledWith(
      { emailId: props.email.id, _action: 'markRead' },
      { method: 'post' }
    );
  });
});
