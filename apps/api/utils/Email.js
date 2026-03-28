const { convert } = require('html-to-text');
const nodemailer = require('nodemailer');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ahmed Wagih <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    let html = '';

    if (template === 'welcome') {
      html = `
        <h1>Welcome, ${this.firstName}!</h1>
        <p>We are excited to have you join us.</p>
      `;
    }

    if (template === 'verifyEmail') {
      html = `
        <h1>Verify your email</h1>
        <p>Hello, ${this.firstName}.</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${this.url}">Verify Email</a>
        <p>This link is valid for 1 hour.</p>
      `;
    }

    if (template === 'resetPassword') {
      html = `
        <h1>Password Reset Requested</h1>
        <p>Hello, ${this.firstName}.</p>
        <p>You requested to reset your password. Click the link below to do so:</p>
        <a href="${this.url}">Reset Password</a>
        <p>This link is valid for only 10 minutes.</p>
      `;
    }

    if (!html) {
      html = `<p>Hello ${this.firstName},</p><p>Please contact support for more details about this email.</p>`;
    }

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the E-Commerce platform!');
  }

  async sendResetPassword() {
    await this.send(
      'resetPassword',
      'Your reset password token (valid for only 10 minutes)'
    );
  }

  async sendPasswordReset() {
    await this.sendResetPassword();
  }

  async sendVerifcationEmailUrl() {
    await this.send('verifyEmail', 'Verify your email address');
  }
}

module.exports = Email;
