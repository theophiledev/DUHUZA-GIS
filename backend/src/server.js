const app = require('./app');
const { verifySmtpConnection } = require('./utils/emailService');

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Property Platform API running on port ${PORT}`);
  await verifySmtpConnection();
});
