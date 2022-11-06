const nodemailer = require("nodemailer");
const config = require("config");
console.log(config.get("jwtPrivateKey"));
console.log(config.get("AUTH_EMAIL"));
// console.log(process.env.AUTH_EMAIL, process./env.AUTH_PASS);

function sendRegisterationMail(data) {
  // console.log(data);
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      // AUTH_EMAIL: process.env.AUTH_EMAIL,
      // AUTH_PASS: process.env.AUTH_PASS,
      user: config.get("AUTH_EMAIL"),
      pass: config.get("AUTH_PASS"),
    },
  });

  let mailOptions = {
    from: '"noreply@exms.com" <omkarm@valueaddsofttech.com>',
    to: `${data.email}`,
    subject: "Registeration Succesful",
    html: ` <div style="background-color: rgb(182, 232, 216); padding: 48px">
    <div>
      Hi
      <span
        ><b><i>${data.firstName + " " + data.lastName},</i></b></span
      >
    </div>
    <p>
      Congratulations! You have successfully signed up for
      <a href="http://localhost:3000/">Exms.com</a>, Thanks for becoming a part of our community!
    </p>
    <p>
      You can Click on this button to login:-
      <a
        href="http://localhost:3000/login"
        style="
          text-decoration: none;
          padding: 6px 10px;
          background-color: rgb(171, 102, 236);
          color: white;
          border-radius: 3px;
        "
        >Login</a
      >
    </p>
    <div>
      <span style="border-bottom: 2px solid black; padding: 2px 6px"
        ><i>Please ,Do not reply to this mail</i></span
      >
    </div>
    <p>Regards,</p>
    <p>admin@exms.com</p>
  </div>`,
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
module.exports = { sendRegisterationMail };
