import Mailer from "../../config/mailer";

export const sendResetInstruction = async admin => {
  const mailer = new Mailer({
    subject: "Request to reset your password",
    receiver: admin.email,
  });
  const resetPath = `/auth/reset_password/${admin.reset_password_token}`;
  if (!isProduction) {
    return;
  }

  const message = `
    <h3>Hello</h3>
    <p>Someone has requested a link to change your password. You can do this through the link below.</p>
    <br/>
    <a href="${ADMIN_HOST}${resetPath}">Reset Password</a>
    <br/>
    <p>If you didn't request this, please ignore this email.\nYour password won't change until you access the link above and create a new one.</p>
  `;

  await mailer.send(message);
};
