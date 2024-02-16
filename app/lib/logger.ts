import pino from 'pino';

export const logger = pino(
  { level: 'info' },
  pino.transport({
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
      {
        target: '@axiomhq/pino',
        options: {
          dataset: process.env['AXIOM_DATASET'],
          token: process.env['AXIOM_TOKEN'],
        },
      },
    ],
  })
);
