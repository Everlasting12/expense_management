const nodemailer = require("nodemailer");
const cron = require("node-cron");
const mongoose = require("mongoose");
const config = require("config");
// const app = require("./src/app");
const { establishDatabaseConnection } = require("./start/db");

let { ExpenseType } = require("./models/expenseTypeModel");
const { PeriodicPayments } = require("./models/periodicpaymentsModel");
const { HouseHold } = require("./models/householdsModel");

const { Householdmember } = require("./models/householdmembersModel");
const { User } = require("./models/usersModel");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});
console.log(process.env.AUTH_EMAIL);

async function getData(todaysDate) {
  const periodicPayments = await PeriodicPayments.find({});
  const households = await HouseHold.find();
  const householdMembers = await Householdmember.find({});
  const users = await User.find({});

  // console.log(
  //   periodicPayments.length,
  //   households.length,
  //   householdMembers.length,
  //   users.length
  // );

  let uniqueHousehold = [];
  households.forEach((household) => {
    householdMembers.forEach((householdMember) => {
      if (
        household._id.toString() === householdMember.houseHold._id.toString()
      ) {
        const index = uniqueHousehold.findIndex(
          (ch) => ch.household.toString() == household._id.toString()
        );
        console.log(index);
        if (index != -1) {
          const user = users.find(
            (u) => u._id.toString() == householdMember.user._id.toString()
          );
          uniqueHousehold[index].member = [
            ...uniqueHousehold[index].member,
            user.email,
          ];
        } else {
          const user = users.find(
            (u) => u._id.toString() == householdMember.user._id.toString()
          );
          const puser = users.find(
            (u) => u._id.toString() == household.createdBy._id.toString()
          );

          uniqueHousehold.push({
            household: household._id,
            householdName: household.name,
            member: [user.email, puser?.email],
          });
        }
      }
    });
  });

  let newEmailData = [];

  periodicPayments.forEach((pp) => {
    uniqueHousehold.forEach((uh) => {
      if (pp.household._id.toString() === uh.household._id.toString()) {
        newEmailData.push({
          household: pp.household,
          householdName: uh.householdName,
          member: uh.member,
          periodicExpense: pp.description,
          duedate: pp.dueDate,
          amount: pp.amount,
          mailtoSendOn:
            pp.frequency == "weekly"
              ? new Date(pp.dueDate - 2 * 86400000)
              : new Date(pp.dueDate - 15 * 86400000),
        });
      }
    });
  });
  console.log(newEmailData);

  newEmailData.forEach((item) => {
    let mailOptions = {
      from: '"noreply@exms.com" <omkarm@valueaddsofttech.com>',
      to: item["member"].join(", "), // separated by comma like: "abc@g.com, xyz@h.com"
      subject: "Reminder - " + item["householdName"] + " Expenses",
      text: `A Gentle reminder of the ${item["periodicExpense"]} of ₹ ${item["amount"]}`,
    };

    // if (
    //   new Date().toISOString().split("T")[0] ==
    //   item.mailtoSendOn.toISOString().split("T")[0]
    // ) {
    //   console.log(item);
    //   transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log("Email sent: " + info.response);
    //     }
    //   });
    // }
  });
}

// cron.schedule("29 18 * * *", () => {
//   getData();
// });
// cron.schedule('*/5 * * * * *', () =>
// {
//     const todaysDate = new Date()
//     getData(todaysDate)

// });
establishDatabaseConnection();
getData(5);
