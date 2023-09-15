# Shuttle

Email testing app, basically a super-simple Putsbox without a UI.

## Stack

- Sendgrid Inbound Parse Webhook
- Netlify Functions
- Netlify hosting and DNS
- Planetscale

## What can it do?

At the moment, it provides a wrapper around the Sendgrid Inbound Parse Webhook. Any email sent to `<userId>@shuttle.email` causes that user to be automatically created and that email to be stored in a `shuttle_db` database hosted on Planetscale. You can these use the API to retrieve the emails sent to a given user.

## API

### Base URL

`https://shuttle-app.netlify.com`

### Get all emails of a given user

- Method: `GET`
- Endpoint: `/api/<userId>`

Returns all emails sent to the user.

### Get last email of a given user

- Method: `GET`
- Endpoint: `/api/<userId>/last`

Returns the last email sent to the user.

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