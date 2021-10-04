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
  await sendMailNow(mailOptions);
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
  await sendMailNow(mailOptions);
};

const sendInvitation = async (to, name) => {
  const mailOptions = {
    from: 'Kelime.com <kelime@hiperlink.com.tr>',
    to: `${to}<${to}>`,
    replyTo: 'kelime@hiperlink.com.tr',
    subject: 'Kelime.com sitesine davet edildiniz',
    text: `${name}, Kelime.com Sözlükler Veritabanını kullanmaktan hoşlanacağınızı düşünüyor. Redhouse Turkish And English Lexicon, Kamûs-i Türki, Derleme Sözlüğü, Kamusu'l-Muhit, Vankulu Lügatı, Tomurcuk İngilizce Sözlük, Genel Osmanlıca Sözlüğü, Genel Arapça Sözlüğü ve onlarca sözlük içerisinde detaylı kelime araması yapabilirsiniz.\n\n Başka sözlükler üzerinde de çalışıyoruz. Sisteme aktarımı biten ve devam eden sözlükler hakkında haberdar olmak için, http://kelime.com/sozlukler adresine tıklayabilirsiniz.\n\nKeyifli araştırmalar ☺\n\nHiperlink Ar-Ge`,
    html: `<strong>${name}</strong>, Kelime.com Sözlükler Veritabanını kullanmaktan hoşlanacağınızı düşünüyor. Redhouse Turkish And English Lexicon, Kamûs-i Türki, Derleme Sözlüğü, Kamusu'l-Muhit, Vankulu Lügatı, Tomurcuk İngilizce Sözlük, Genel Osmanlıca Sözlüğü, Genel Arapça Sözlüğü ve onlarca sözlük içerisinde detaylı kelime araması yapabilirsiniz.<br/><br/>Başka sözlükler üzerinde de çalışıyoruz. Sisteme aktarımı biten ve devam eden sözlükler hakkında haberdar olmak için, <strong><a href="http://kelime.com/sozlukler" target="_blank">buraya</a></strong> tıklayabilirsiniz.<br/><br/>Keyifli araştırmalar ☺<br/><br/>Hiperlink Ar-Ge`,
  };
  await sendMailNow(mailOptions);
};

const sendContactMessage = async (message) => {
  const mailOptions = {
    from: 'Kelime.com <kelime@hiperlink.com.tr>',
    to: `Kelime.com <kelime@hiperlink.com.tr>`,
    replyTo: 'kelime@hiperlink.com.tr',
    subject: 'Kelime.com sitesi iletişim formu üzerinden gönderilen bir mesajınız var!',
    text: `Gönderilen mesaj içeriği\n\n
    Göderen isim : ${message.adisoyadi}\n\n
    Email adresi: ${message.email} \n\n
    Konu: ${message.konu} \n\n
    Başlık: ${message.baslik} \n\n
    Mesaj: ${message.mesaj}`,
    html: `Gönderilen mesaj içeriği<br/><br/>
    Göderen isim : <strong>${message.adisoyadi}</strong><br/>
    Email adresi: ${message.email} <br/>
    Konu: ${message.konu} <br/>
    Başlık: ${message.baslik} <br/>
    Mesaj: ${message.mesaj}`,
  };
  await sendMailNow(mailOptions);
};

module.exports = {
  sendMailNow,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendInvitation,
  sendContactMessage,
};
