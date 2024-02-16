import pino from 'pino';
import '@axiomhq/pino';

const targets: pino.TransportMultiOptions['targets'] = [
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
].filter(
  ({ target }) =>
    process.env.NODE_ENV !== 'development' && target !== 'pino-pretty'
);

export const logger = pino({ level: 'info' }, pino.transport({ targets }));
