import nodemailer from 'nodemailer';

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
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
