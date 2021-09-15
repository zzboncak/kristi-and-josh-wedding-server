module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  CLIENT_ORIGIN: ['https://rsvp-manager.vercel.app', 'http://localhost:3000', 'http://localhost:3001', 'https://www.joshandkristi.wedding'],
};
