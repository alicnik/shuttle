import {
  createMockFormData,
  setWindowWidth,
  setupRemixStub,
} from '../test-utils';
import { screen } from '@testing-library/react';
import { EmailCard } from '~/components';
import { useNavigation, useSearchParams } from '@remix-run/react';
import { fromPartial } from '@total-typescript/shoehorn';

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
  selected: [],
  setSelected: vi.fn(),
};

describe('EmailCard', () => {
  describe('render', () => {
    beforeEach(() => {
      setWindowWidth(1024);
      vi.useFakeTimers();
      vi.setSystemTime(new Date('October 13, 2023 13:07:00'));
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('should match the snapshot for mobile view', () => {
      setWindowWidth(375);

      const { container } = setupRemixStub(<EmailCard {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should match the snapshot for tablet view', () => {
      setWindowWidth(768);

      const { container } = setupRemixStub(<EmailCard {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should match the snapshot for desktop view', () => {
      setWindowWidth(1024);

      const { container } = setupRemixStub(<EmailCard {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('renders the email from when it is received in angle brackets', () => {
      setupRemixStub(
        <EmailCard
          {...props}
          email={{ ...props.email, from: '<Joe Bloggs>' }}
        />
      );

      expect(screen.getByText('Joe Bloggs')).toBeInTheDocument();
    });

    it('applies the data-selected attribute when the email is selected', () => {
      setupRemixStub(<EmailCard {...props} selected={['mock-id']} />);

      const card = screen.getByTestId('email-card');
      const checkbox = screen.getByRole('checkbox');

      expect(card).toHaveAttribute('data-selected', 'true');
      expect(checkbox).toBeChecked();
    });

    it('applies the data-in-view attribute when the email is being previewed', () => {
      vi.mocked(useSearchParams).mockReturnValueOnce([
        new URLSearchParams({
          preview: props.email.id,
        }),
        vi.fn(),
      ]);

      setupRemixStub(<EmailCard {...props} />);

      const card = screen.getByTestId('email-card');

      expect(card).toHaveAttribute('data-in-view', 'true');
    });

    it.each([
      { state: 'read', read: true },
      { state: 'unread', read: false },
    ])(
      `applies the data-read attribute when the email is $state`,
      ({ read }) => {
        setupRemixStub(
          <EmailCard {...props} email={{ ...props.email, read }} />
        );

        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('data-read', String(read));
      }
    );

    it('applies the data-read attribute optimistically when the email is marked read', () => {
      const formData = createMockFormData({
        _action: 'markRead',
        emailId: props.email.id,
      });

      vi.mocked(useNavigation).mockReturnValueOnce(
        fromPartial({
          state: 'loading',
          formData,
        })
      );

      setupRemixStub(<EmailCard {...props} />);

      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('data-read', 'true');
    });

    it('disapplies the data-read attribute optimistically when the email is marked unread', () => {
      const formData = createMockFormData({
        _action: 'markSelectedUnread',
        selected: props.email.id,
      });

      vi.mocked(useNavigation).mockReturnValueOnce(
        fromPartial({
          state: 'loading',
          formData,
        })
      );

      setupRemixStub(
        <EmailCard {...props} email={{ ...props.email, read: true }} />
      );

      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('data-read', 'false');
    });
  });

  describe('interaction', () => {
    it('resets the selected emails when the card is clicked', async () => {
      const { user } = setupRemixStub(<EmailCard {...props} />);

      await user.click(screen.getByRole('button'));

      expect(props.setSelected).toHaveBeenCalledWith([]);
    });
  });

  it('adds the email id to the existing selected emails when the checkbox is checked', async () => {
    const { user } = setupRemixStub(<EmailCard {...props} />);

    await user.click(screen.getByRole('checkbox'));

    const setSelectedCallback = props.setSelected.mock.lastCall[0];
    const nextState = setSelectedCallback(['existing-id']);

    expect(nextState).toEqual(['existing-id', 'mock-id']);
  });

  it('removes the email id from the existing selected emails when the checkbox is unchecked', async () => {
    const mockSearchParams = new URLSearchParams({ preview: props.email.id });
    const mockSetSearchParams = vi.fn();
    vi.mocked(useSearchParams).mockReturnValueOnce([
      mockSearchParams,
      mockSetSearchParams,
    ]);

    const { user } = setupRemixStub(
      <EmailCard {...props} selected={['mock-id']} />
    );

    await user.click(screen.getByRole('checkbox'));

    const setSelectedCallback = props.setSelected.mock.lastCall[0];
    const nextSelectedState = setSelectedCallback(['mock-id', 'existing-id']);

    const setSearchParamsCallback = mockSetSearchParams.mock.lastCall[0];
    const nextSearchParamsState = setSearchParamsCallback(mockSearchParams);

    expect(nextSelectedState).toEqual(['existing-id']);
    expect(nextSearchParamsState).toEqual(
      new URLSearchParams({ preview: 'existing-id' })
    );
  });
});
