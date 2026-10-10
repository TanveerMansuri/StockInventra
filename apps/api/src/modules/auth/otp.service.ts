import { prisma } from "../../database/prisma";
import { generateOTP, hashOTP, verifyOTP } from "../../utils/otp";
import { sendMail } from "../../utils/mailer";

export class OTPService {
  static async sendOTP(email: string, purpose: 'PASSWORD_RESET') {
    // Delete existing OTPs for this email and purpose
    await prisma.verificationToken.deleteMany({
      where: { email, purpose },
    });

    const otp = generateOTP();
    const tokenHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
      data: {
        email,
        tokenHash,
        purpose,
        expiresAt,
      },
    });

    const subject = 'Password Reset Request';
    const html = `<p>Your code is: <strong>${otp}</strong></p><p>It expires in 15 minutes.</p>`;

    await sendMail(email, subject, html);
  }

  static async verifyOTP(email: string, purpose: 'PASSWORD_RESET', otp: string): Promise<boolean> {
    const token = await prisma.verificationToken.findFirst({
      where: { email, purpose, expiresAt: { gt: new Date() } },
    });

    if (!token) return false;

    const isValid = await verifyOTP(otp, token.tokenHash);
    if (isValid) {
      await prisma.verificationToken.delete({ where: { id: token.id } });
      return true;
    }
    return false;
  }
}
