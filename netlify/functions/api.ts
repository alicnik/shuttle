import 'dotenv/config';
import express, { Router } from 'express';
import serverless from 'serverless-http';
import multer from 'multer';
import { db } from '../../lib/db';

const app = express();
const router = Router();
const upload = multer();

router.post('/webhook', upload.none(), async (req, res) => {
  try {
    const data = req.body;
    const username = data.to.slice(0, data.to.indexOf('@'));

    await db.user.create({
      data: {
        id: username,
        emails: {
          create: [{ html: data.html, text: data.text }],
        },
      },
    });
    res.status(200).send('Email processed successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing email.');
  }
});

router.get('/:userId/last', async (req, res) => {
  const { userId } = req.params;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { emails: true },
  });

  if (!user) {
    res.status(404).send('User not found.');
    return;
  }

  const email = user.emails[0];

  if (!email) {
    res.status(404).send('Email not found.');
    return;
  }

  res.status(200).send(email.html);
});

app.use('/api/', router);

export const handler = serverless(app);
