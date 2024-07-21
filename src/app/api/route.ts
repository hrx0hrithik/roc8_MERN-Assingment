import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

export async function sendOtpEmail(name: string, email: string, otp: string) {
  if (!process.env.MAIL_API_KEY) {
    throw new Error('MAIL_API_KEY is not defined');
  }

  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAIL_API_KEY,
    });

    const sentFrom = new Sender("hrithik@trial-0p7kx4xnxv8g9yjr.mlsender.net", "Hrithik");

    const recipients = [
      new Recipient(email, name)
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Your OTP Code")
      .setHtml(`<strong>Hello ${name},</strong><br><br>Your OTP code is: <strong>${otp}</strong><br><br>Thank you!`)
      .setText(`Hello ${name},\n\nYour OTP code is: ${otp}\n\nThank you!`);

    await mailerSend.email.send(emailParams);
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    throw new Error(error.message || 'An error occurred while sending the email');
  }
}
