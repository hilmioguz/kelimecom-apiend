const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const config = require('../config/config');

const { OAuth2 } = google.auth;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: config.oauth.refreshToken,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject();
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.oauth.user,
      accessToken,
      clientId: config.oauth.clientId,
      clientSecret: config.oauth.clientSecret,
      refreshToken: config.oauth.refreshToken,
    },
  });

  return transporter;
};

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendMailNow = async (emailOptions) => {
  const emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `https://test.kelime.com/reset-password?token=${token}`;
  const mailOptions = {
    from: 'Kelime.com <kelime@hiperlink.com.tr>',
    to: `${to}<${to}>`,
    replyTo: 'kelime@hiperlink.com.tr',
    subject: 'Kelime.com şifre sıfırlama',
    html: `Merhaba,\n
    Şifrenizi sıfırlamak için şu bağlantıya tıklayın: ${resetPasswordUrl}
    Herhangi bir şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı dikkate almayın.\n\nKelime.com`,
  };

  await sendMailNow(mailOptions);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `https://test.kelime.com/verify-email?token=${token}`;
  const mailOptions = {
    from: 'Kelime.com <kelime@hiperlink.com.tr>',
    to: `${to}<${to}>`,
    replyTo: 'kelime@hiperlink.com.tr',
    subject: 'Kelime.com e-posta doğrulama',
    text: `Merhaba,\n
    E-postanızı doğrulamak için şu bağlantıya tıklayın: ${verificationEmailUrl}
    Bir hesap oluşturmadıysanız, bu e-postayı dikkate almayın.\n\nKelime.com`,
  };
  const a = await sendMailNow(mailOptions);
  // eslint-disable-next-line no-console
  console.log('mail sent:', a);
};

const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: 'Kelime.com <kelime@hiperlink.com.tr>',
    to: `${to}<${to}>`,
    replyTo: 'kelime@hiperlink.com.tr',
    subject: 'Kelime.com üyelik kaydınız',
    text: `Sayın ${name}, üyelik kaydınız gerçekleştirilmiştir. Sitemize üye olduğunuz için teşekkür ederiz.
    Bir hesap oluşturmadıysanız, bu e-postayı dikkate almayınız. \n\nKelime.com`,
  };
  const a = await sendMailNow(mailOptions);
  // eslint-disable-next-line no-console
  console.log('mail sent:', a);
};

module.exports = {
  sendMailNow,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
};
