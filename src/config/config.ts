import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  openAiKey: process.env.OPENAI_API_KEY || '',
  adminUsers: (process.env.ADMIN_USERS || '').split(',').filter(Boolean),
  logLevel: process.env.LOG_LEVEL || 'info',
  sessionPath: process.env.SESSION_PATH || './whatsapp_sessions'
};

export type Config = typeof config;
