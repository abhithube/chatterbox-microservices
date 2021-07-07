import sendgrid from '../config/sendgrid';

const sendVerificationEmail = async (
  email: string,
  verificationToken: string
): Promise<void> => {
  await sendgrid.send({
    from: { name: 'ChatterBox', email: 'chatterbox@abhithube.com' },
    to: email,
    subject: 'Email Verification',
    html: `<p>Confirm your email address <a href="${process.env.SERVER_URL}/api/auth/confirm-email?token=${verificationToken}">here</>.</p>`,
  });
};

const sendResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  await sendgrid.send({
    from: { name: 'ChatterBox', email: 'chatterbox@abhithube.com' },
    to: email,
    subject: 'Password Reset',
    html: `<p>Reset your password <a href="${process.env.CLIENT_URL}/reset?token=${resetToken}">here</>.</p>`,
  });
};

export default { sendVerificationEmail, sendResetEmail };
