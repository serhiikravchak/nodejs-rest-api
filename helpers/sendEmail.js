const nodemailer = require("nodemailer");
require("dotenv").config();

const { UKR_NET_EMAIL, UKR_NET_PASSWORD } = process.env;

const nodemailerConfig = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: UKR_NET_EMAIL,
    pass: UKR_NET_PASSWORD,
  }
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
    const email = { ...data, from: UKR_NET_EMAIL }
    await transport.sendMail(email).then(() => console.log("Email send successfully"))
  .catch(error => console.log(error.message));
    return true;
};

module.exports = sendEmail;