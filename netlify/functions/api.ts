import 'dotenv/config';
import express, { Router } from 'express';
import serverless from 'serverless-http';
import multer from 'multer';
import { parse } from 'node-html-parser';
import { db } from 'db';

const app = express();
const router = Router();
const upload = multer();

router.post('/webhook', upload.none(), async (req, res) => {
  try {
    const data = req.body;
    const username = data.to.slice(0, data.to.indexOf('@'));
    const email = {
      from: data.from,
      subject: data.subject,
      html: data.html,
      text: data.text,
    };

    await db.user.upsert({
      where: { id: username },
      create: {
        id: username,
        emails: {
          create: email,
        },
      },
      update: {
        emails: {
          create: email,
        },
      },
    });

    res.status(200).send('Email processed successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing email.');
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { emails: true },
  });

  if (!user) {
    res.status(404).send('User not found.');
    return;
  }

  res.status(200).send(user.emails);
});

router.get('/:userId/last', async (req, res) => {
  const { userId } = req.params;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      emails: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
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

  let data = email.html;
  const { link, param } = req.query;

  if (link && typeof link === 'string') {
    if (!email.html) {
      res.status(400).send('Email did not contain any html.');
      return;
    }

    const targetLinkText = decodeURIComponent(link);
    const root = parse(email.html);
    const links = root.querySelectorAll('a');
    const targetLink = links.find(
      ({ text }) =>
        text.trim().toLowerCase() === targetLinkText.trim().toLowerCase()
    );

    if (!targetLink) {
      res.status(404).send(`Link with text "${link}" not found.`);
      return;
    }

    const href = targetLink.getAttribute('href');
    if (!href) {
      res.status(404).send(`Target link "${targetLink}" has no href.`);
      return;
    }

    data = href;

    if (param && typeof param === 'string') {
      const url = new URL(href);
      const targetParamValue = url.searchParams.get(param);

      if (!targetParamValue) {
        res
          .status(404)
          .send(
            `Param "${param}" not found in href "${href}" on target link "${targetLink}".`
          );
        return;
      }

      data = targetParamValue;
    }
  }

  res
    .status(200)
    .set('Content-Type', link ? 'text/plain' : 'text/html')
    .send(data);
});

app.use('/api/', router);

export const handler = serverless(app);
