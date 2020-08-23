const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class NewMail {
  constructor(user, link) {
    this.firstName = user.name.split(' ')[0];
    this.url = link;
    this.from = `Akshat Trivedi <${process.env.EMAIL}>`;
    this.to = user.email;
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.GPASS,
        },
      });
    }
    return nodemailer.createTransport({
      //service: Gmail
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER_NAME,
        pass: process.env.MAIL_PASSWORD,
      },
      //turn off sercurity in Gmail account
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      //html: ------
    };

    this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    this.send('welcome', 'Welcome to our Natours Family');
  }

  async sendResetPassword() {
    this.send(
      'resetPassword',
      'Forgot your password. Here is your reset token (valid for 10 minutes only).'
    );
  }
};
