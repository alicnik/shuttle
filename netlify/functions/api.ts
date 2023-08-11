import 'dotenv/config';
import express, { Router } from 'express';
import serverless from 'serverless-http';
import { db } from '../../lib/db';

const app = express();
const router = Router();

router.post('/webhook', async (req, res) => {
  try {
    const emailData = req.body;
    console.log(req.body);
    res.status(200).send('Email processed successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing email.');
  }
});

router.get('/:userId/last', async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  res.status(200).send('User says hi');
});

app.use('/api/', router);

export const handler = serverless(app);
