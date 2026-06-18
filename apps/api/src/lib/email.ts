import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, userId: string) => {
  const token = Buffer.from(userId).toString('base64');
  const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your LightIt account',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #fff; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="background: linear-gradient(135deg, #0ea5e9, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">LightIt</h1>
          <p style="color: #94a3b8; margin-top: 8px;">AI-Powered Startup-Investor Matchmaking</p>
        </div>
        <h2 style="color: #e2e8f0; margin-bottom: 16px;">Verify your email address</h2>
        <p style="color: #94a3b8; line-height: 1.6;">Click the button below to verify your email and activate your LightIt account.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link expires in 24 hours. If you did not create this account, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendOTPEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your LightIt OTP Code',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="background: linear-gradient(135deg, #0ea5e9, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">LightIt</h1>
        <h2 style="color: #e2e8f0;">Your verification code</h2>
        <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #0ea5e9;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes.</p>
      </div>
    `,
  });
};
