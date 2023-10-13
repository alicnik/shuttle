import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { unstable_createRemixStub as createRemixStub } from '@remix-run/testing';

export const setup = (
  jsx: Parameters<typeof render>[0],
  renderOptions?: Parameters<typeof render>[1],
  userOptions?: Parameters<typeof userEvent.setup>[0]
) => {
  return {
    ...render(jsx, renderOptions),
    user: userEvent.setup(userOptions),
  };
};

export const setupRemixStub = (
  jsx: Parameters<typeof render>[0],
  renderOptions?: Parameters<typeof render>[1],
  userOptions?: Parameters<typeof userEvent.setup>[0]
) => {
  const RemixStub = createRemixStub([
    {
      path: '/',
      Component: () => jsx,
      action: vi.fn(() => null),
    },
  ]);

  return {
    ...setup(<RemixStub />, renderOptions, userOptions),
  };
};

export const setWindowWidth = (width: number) => {
  // @ts-ignore
  window.happyDOM.setInnerWidth(width);
};

export const createMockFormData = (data: Record<string, string | Blob>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};
