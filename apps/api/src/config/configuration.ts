export default () => ({
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  DATABASE_URL: process.env.DATABASE_URL,
  WS_PATH: process.env.WS_PATH ?? "/ws",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*"
});
