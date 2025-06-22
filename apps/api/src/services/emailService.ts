import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter: nodemailer.Transporter;

  public static async initialize(): Promise<void> {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await this.transporter.verify();
    console.log('[INFO] Email service initialized');
  }

  public static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      await this.initialize();
    }

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`[INFO] Email sent to ${to}`);
  }

  // Simple HTML templates
  public static getWelcomeTemplate(name: string, verificationLink: string): string {
    return `
      <h1>Welcome to PropScholar!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining PropScholar!</p>
      <p><a href="${verificationLink}">Verify your email</a></p>
    `;
  }

  public static getOTPTemplate(name: string, otp: string): string {
    return `
      <h1>Login Verification</h1>
      <p>Hi ${name},</p>
      <p>Your verification code is: <strong>${otp}</strong></p>
    `;
  }

  public static getPasswordResetTemplate(name: string, resetLink: string): string {
    return `
      <h1>Password Reset</h1>
      <p>Hi ${name},</p>
      <p><a href="${resetLink}">Reset your password</a></p>
    `;
  }

  public static getPasswordChangedTemplate(name: string): string {
    return `
      <h1>Password Changed</h1>
      <p>Hi ${name},</p>
      <p>Your password has been successfully changed.</p>
    `;
  }
} 