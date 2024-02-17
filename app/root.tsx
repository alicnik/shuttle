import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { Toaster } from '~/components/ui/toaster';
import type { LoaderFunctionArgs, LinksFunction } from '@remix-run/node';
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from 'remix-themes';

import mainStylesheetUrl from './styles/main.css';
import tailwindStylesheetUrl from './styles/tailwind.css';
import { Button } from './components';
import { themeSessionResolver } from './lib/theme-session.server';
import { cn } from './lib';

export const links: LinksFunction = () => [
  { rel: 'icon', href: 'favicon.png' },
  { rel: 'stylesheet', href: mainStylesheetUrl },
  { rel: 'stylesheet', href: tailwindStylesheetUrl },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
  };
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <Document theme={data.theme}>
        <Outlet />
      </Document>
    </ThemeProvider>
  );
}

function Document({
  title,
  children,
  theme,
}: React.PropsWithChildren<{
  title?: string;
  theme?: Awaited<ReturnType<typeof loader>>['theme'];
}>) {
  const [currentTheme] = useTheme();

  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn(currentTheme, 'h-full overflow-hidden')}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(theme)} />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body className="h-full dark:bg-zinc-900">
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV !== 'production' && <LiveReload />}
        <Toaster />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <Document title="Uh-oh!">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="mb-4 text-3xl">Oh dear, something went wrong.</h1>
        <p className="mb-6 text-lg">Click below to go back to safety...</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </Document>
  );
}
