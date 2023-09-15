# Shuttle

Email testing app, basically a super-simple Putsbox without a UI.

## Uses

- Sendgrid Inbound Parse Webhook
- Netlify Functions
- Netlify hosting and DNS
- Planetscale

## Development

To run the Netlify functions locally, you can use the netlify cli. This can be installed with brew on Mac.
```sh
brew install netlify-cli
```

Then in the root of the repo run:
```sh
yarn install
netlify dev
```

Note: if you're having trouble connecting to a database, ensure you are not on a VPN.

## Deployment

CD is setup on `main`. Any changes to the `main` branch will be automatically deployed to production.

## Useful Resources

- [Prisma Planetscale Docs](https://www.prisma.io/docs/guides/database/planetscale)