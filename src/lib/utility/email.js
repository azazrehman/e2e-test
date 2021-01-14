var nodemailer = require('nodemailer');
module.exports = {
  sendEmail: function (email, password,message,toRecipt,subject,mailBody) {
    var transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      secureConnection: false,
      port: 587,
      tls: {
        ciphers: 'SSLv3'
      },
      auth: {
        user: email,
        pass: password
      }
    });
    var mailOptions = {
      from: email,
      to: toRecipt,
      subject: subject,
      html: mailBody,
    };
    console.log('Email Sent'+message)
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
  }
}