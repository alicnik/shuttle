import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

import mainStylesheetUrl from './main.css';
import tailwindStylesheetUrl from './tailwind.css';

export const meta: MetaFunction = () => [{ title: 'Shuttle' }];

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: mainStylesheetUrl },
  { rel: 'stylesheet', href: tailwindStylesheetUrl },
];

export default function App() {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="container mx-auto h-full bg-zinc-900">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
