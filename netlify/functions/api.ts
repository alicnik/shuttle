import "dotenv/config";
import express, { Router } from "express";
import serverless from "serverless-http";
import multer from "multer";
import { db } from "db";

const app = express();
const router = Router();
const upload = multer();

router.post("/webhook", upload.none(), async (req, res) => {
  try {
    const data = req.body;
    const username = data.to.slice(0, data.to.indexOf("@"));
    const email = {
      from: data.from,
      subject: data.subject,
      html: data.html,
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

    res.status(200).send("Email processed successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing email.");
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { emails: true },
  });

  if (!user) {
    res.status(404).send("User not found.");
    return;
  }

  res.status(200).send(user.emails);
});

router.get("/:userId/last", async (req, res) => {
  const { userId } = req.params;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { emails: true },
  });

  if (!user) {
    res.status(404).send("User not found.");
    return;
  }

  const email = user.emails[0];

  if (!email) {
    res.status(404).send("Email not found.");
    return;
  }

  res.status(200).send(email.html);
});

router.delete("/cleanup", async () => {
  await db.user.deleteMany();
  await db.email.deleteMany({
    where: {
      userId: null,
    },
  });

  return {
    statusCode: 204,
  };
});

app.use("/api/", router);

export const handler = serverless(app);
