import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { Toaster } from '~/components/ui/toaster';
import { type LinksFunction } from '@remix-run/node';

import mainStylesheetUrl from './styles/main.css';
import tailwindStylesheetUrl from './styles/tailwind.css';
import { Button, ThemeScript } from './components';

export const links: LinksFunction = () => [
  { rel: 'icon', href: 'favicon.png' },
  { rel: 'stylesheet', href: mainStylesheetUrl },
  { rel: 'stylesheet', href: tailwindStylesheetUrl },
];

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

function Document({
  title,
  children,
}: React.PropsWithChildren<{ title?: string }>) {
  return (
    <html suppressHydrationWarning lang="en" className="h-full overflow-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <ThemeScript />
        <Meta />
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
