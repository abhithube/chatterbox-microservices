import transport from '../config/transport';

const sendVerificationEmail = async (
  email: string,
  verificationToken: string
): Promise<void> => {
  await transport.sendMail({
    from: 'chatterbox@abhithube.com',
    to: email,
    subject: 'Email Verification',
    html: `<p>Confirm your email address <a href="http://localhost:5003/api/auth/confirm-email?token=${verificationToken}">here</>.</p>`,
  });
};

const sendResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  await transport.sendMail({
    from: 'chatterbox@abhithube.com',
    to: email,
    subject: 'Password Reset',
    html: `<p>Reset your password <a href="http://localhost:5003/api/auth/reset-password?token=${resetToken}">here</>.</p>`,
  });
};

export default { sendVerificationEmail, sendResetEmail };
