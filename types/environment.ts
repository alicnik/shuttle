declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_URL: string;
      DB_ORG: string;
      DB_TOKEN: string;
      DB_TOKEN_NAME: string;
      SESSION_SECRET: string;
    }
  }
}

export {};
