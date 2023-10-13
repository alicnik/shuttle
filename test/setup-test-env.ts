import { installGlobals } from '@remix-run/node';
import '@testing-library/jest-dom/vitest';

installGlobals();

vi.mock('@remix-run/react', async () => {
  const actual = (await vi.importActual(
    '@remix-run/react'
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  )) as typeof import('@remix-run/react');
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    useNavigation: vi.fn(actual.useNavigation),
  };
});
