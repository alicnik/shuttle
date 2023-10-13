import { render } from '@testing-library/react';
import { ThemeScript } from '~/components';

describe('Theme', () => {
  it('should match the snapshot', () => {
    const { container } = render(<ThemeScript />);

    expect(container).toMatchSnapshot();
  });
});
