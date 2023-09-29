import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { Toaster } from '~/components/ui/toaster';
import type { LinksFunction } from '@remix-run/node';

import mainStylesheetUrl from './styles/main.css';
import tailwindStylesheetUrl from './styles/tailwind.css';

export const links: LinksFunction = () => [
  { rel: 'icon', href: 'favicon.png' },
  { rel: 'stylesheet', href: mainStylesheetUrl },
  { rel: 'stylesheet', href: tailwindStylesheetUrl },
];

export default function App() {
  return (
    <html lang="en" className="dark h-full overflow-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-zinc-900">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV !== 'production' && <LiveReload />}
        <Toaster />
      </body>
    </html>
  );
}
