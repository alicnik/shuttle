# Shuttle

An email testing app that offers a UI and an API for processing inbound emails to any username.

## Stack

- Sendgrid Inbound Parse Webhook
- Netlify Functions
- Netlify hosting and DNS
- Neon DB
- Remix
- React
- Prisma
- Axiom (logging)

## What can it do?

Shuttle is a simple email testing app. Any emails sent to `<whatever>@shuttle.email` will automatically create that user and store the email in the database. You can then view the emails sent to that user by visiting `https://shuttle-app.netlify.com/<whatever>`. Alternatively, you can view the last email sent to that user by visiting `https://shuttle-app.netlify.com/api/<whatever>/last`.

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

- Query Params:
  - `link` - If a value is provided, the response will be the href of the link with the given text. The value should be a url encoded string. It is not case sensitive.
  - `param` - (Must be used with `link`) If a value is provided, the response will be the value of the query param with the given name in the href of the link with the given text.

#### Example

```txt
GET https://shuttle-app.netlify.com/api/john-smith/last?link=verify%20account&param=token
```

Assuming a DOM element like this exists in the last email sent to `john-smith`:

```html
<a href="https://example.com/verify?token=12345">Verify Account</a>
```

The response would be:

```txt
12345
```

## Development

### Database

The deployed code uses a postgres database hosted on NeonDB. The connection string is read from a local `.env` file. To set up a local mysql database for development, follow these steps:

1. Install postgres and create a database

   ```sh
   brew install postgresql
   brew services start postgresql
   createdb shuttle_db
   ```

2. In the root of the repo, create a `.env` and add the following:

   ```sh
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/shuttle_db"
   ```

3. Push the Prisma schema to your local database instance:

   ```sh
   npx prisma db push
   ```

### UI

The UI is a Remix app. If you do not need the serverless function, i.e. the api, you can run the local Remix server by running:

```sh
yarn dev
```

### Netlify functions

To run the Netlify functions locally, i.e. to expose the serverless api, you can use the netlify cli. This can be installed with brew on Mac.

```sh
brew install netlify-cli
```

Then in the root of the repo run:

```sh
yarn install
netlify dev
```

## Deployment

CD is setup on `main`. Any changes to the `main` branch will be automatically deployed to production.
