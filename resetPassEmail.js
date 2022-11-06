const nodemailer = require("nodemailer");
const config = require("config");
console.log(config.get("jwtPrivateKey"));
console.log(config.get("AUTH_EMAIL"));
// console.log(process.env.AUTH_EMAIL, process./env.AUTH_PASS);

function resetPasswordEmail(data) {
  // console.log(data);
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      // user: process.env.AUTH_EMAIL,
      // pass: process.env.AUTH_PASS,
      user: config.get("AUTH_EMAIL"),
      pass: config.get("AUTH_PASS"),
    },
  });

  let mailOptions = {
    from: '"noreply@exms.com" <omkarm@valueaddsofttech.com>',
    to: `${data.email}`,
    subject: "Update the password",
    // text: `Link for updating the password :-${
    //   "http://localhost:3000/changepassword/" + data._id
    // }`,
    html: `<span>Click on button for updating the password</span>
     :-<button type="button" class="btn btn-primary">
     <a href=${
       "http://localhost:3000/changepassword/" + data._id
     }}>Reset Password</a></button> `,
  };

  mailTransporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
// sendRegisterationMail(3);
module.exports = { resetPasswordEmail };
