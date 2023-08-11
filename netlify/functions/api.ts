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
    console.log({ ...data });
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
