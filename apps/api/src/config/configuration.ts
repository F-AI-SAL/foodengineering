export default () => ({
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  DATABASE_URL: process.env.DATABASE_URL,
  WS_PATH: process.env.WS_PATH ?? "/ws",
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1d",
  APP_URL: process.env.APP_URL,
  NOTIFICATIONS_URL: process.env.NOTIFICATIONS_URL,
  NOTIFICATIONS_SHARED_SECRET: process.env.NOTIFICATIONS_SHARED_SECRET
});
