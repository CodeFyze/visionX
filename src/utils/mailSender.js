const nodemailer = require("nodemailer");

const mailSender = async (email, subject, bodyText) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ahadmagsi2000@gmail.com", // Replace with your email
      pass: "yumv twrp ksfh kftl", // Replace with your email password
    },
  });

  const mailOptions = {
    from: "ahadmagsi2000@gmail.com",
    to: email,
    subject: subject,
    text: bodyText,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  mailSender,
};
