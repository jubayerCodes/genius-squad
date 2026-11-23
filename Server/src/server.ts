import app from './app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Genius Squad Backend Server is running on port ${PORT}`);
});

process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Rejection detected! Shutting down gracefully...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err: any) => {
  console.error('Uncaught Exception detected! Exiting...', err);
  process.exit(1);
});
