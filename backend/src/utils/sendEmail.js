import nodemailer from 'nodemailer';

const getTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 2525,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    logger: true,
    debug: true,
  });

export const sendEmail = async ({ email, subject, message, htmlMessage }) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `HealthyUp <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: message,
    html: htmlMessage,
  });
};
