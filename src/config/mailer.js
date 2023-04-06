import 'dotenv/config'
import nodemailer from "nodemailer";

const config = {
  host: process.env.AWS_SES_HOST,
  port: 465,
  tls: true,
  ssl: true,
  secure: true,
  auth: {
    user: process.env.AWS_SES_USER_NAME,
    pass: process.env.AWS_SES_PASSWORD,
  },
};

class Mailer {
  constructor(args) {
    this.subject = args.subject || ''
    this.sender = process.env.SENDER_MAILER || ''
    this.receiver = args.receiver || ''
  }

  send = async (message) => {
    const transporter = nodemailer.createTransport(config);
    await transporter.sendMail({
      from: this.sender,
      to: this.receiver,
      subject: this.subject,
      html: message,
    });
  }
}

export default Mailer;