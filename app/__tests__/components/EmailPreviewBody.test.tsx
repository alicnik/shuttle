import { render, screen } from '@testing-library/react';
import { EmailPreviewBody } from '~/components';

describe('EmailPreviewBody', () => {
  it('renders an iframe with the expected title attribute', () => {
    render(<EmailPreviewBody />);

    const iframe = screen.getByTestId('email-preview-body');

    expect(iframe).toHaveAttribute('title', 'Email preview');
  });

  it('passes the html to the iframe srcDoc attribute', () => {
    const html = '<p>Hello world</p>';

    render(<EmailPreviewBody html={html} />);

    const iframe = screen.getByTestId('email-preview-body');

    expect(iframe).toHaveAttribute('srcDoc', html);
  });

  it('inserts a base tag into the html to ensure links open in a new tab', () => {
    const html = '<html><head></head><body><p>Hello world</p></body></html>';

    render(<EmailPreviewBody html={html} />);

    const iframe = screen.getByTestId('email-preview-body');

    expect(iframe).toHaveAttribute(
      'srcDoc',
      '<html><head><base target="_blank"></head><body><p>Hello world</p></body></html>'
    );
  });
});
