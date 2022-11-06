const express = require("express");
const router = express.Router();

const { User, userSchema, validateUser } = require("../models/usersModel");
const loadsh = require("loadsh");
const bcrypt = require("bcrypt");

const auth = require("../middlewears/auth.js");
const validateObjId = require("../middlewears/validateobjectId");
const admin = require("../middlewears/admin");

//nodemailer
const { sendRegisterationMail } = require("../registerEmail");
const { resetPasswordEmail } = require("../resetPassEmail");

router.get("/", async (req, res) => {
  const users = await User.find({});
  if (users && users.length === 0)
    return res.status(404).send("users not found");

  res.status(200).send(users);
});
router.get("/:id", validateObjId, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).send("Given id is not found");
  }
  res.status(200).send(user);
});

router.post("/pfs", auth, async (req, res) => {
  let { titleName } = req.body;
  let query = {};
  let query2 = {};
  let query3 = {};
  if (titleName) {
    console.log("in pfs api:" + titleName);
    reg = new RegExp(`^${titleName}`, "i");
    query["firstName"] = reg;
    query2["role"] = reg;
    query3["lastName"] = reg;
  }
  //to find by role,firstName
  const user = await User.find({ $or: [query, query2, query3] });
  if (!user) return res.status(404).send("user not found");
  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  // console.log("in post register");
  console.log(req.body);
  const { error } = validateUser(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send(error.message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("user already exists");

  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    userName: req.body.userName,
    password: req.body.password,
    role: req.body.role,
    isActive: req.body.isActive,
    updatedBy: req.body.updatedBy,
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  await user.save();
  //sending thee data to nodemailer
  sendRegisterationMail(user);
  res.send(loadsh.pick(user, ["userName", "email", "role"]));
});

router.put("/:id", auth, async (req, res) => {
  // const { error } = validateHousehold(req.body);
  // if (error) {
  //   console.log(error.message);
  //   return res.status(400).send(error.details[0].message);
  // }

  let user = {};
  user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        userName: req.body.userName,
        isActive: req.body.isActive,
        updatedBy: req.body.updatedBy,
      },
    },
    { new: true, runValidators: true }
  );

  if (!user) return res.status(404).send("given id is not found");
  await user.save();
  res.send(user);
});

router.patch("/forgetpassword", async (req, res) => {
  console.log(req.body);
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("user not exists");

  try {
    resetPasswordEmail(user);
  } catch {
    console.log("error in forget passwoed api");
  }

  console.log("in beackend user.js for reset the password");
  res.send(user);
});

router.put("/changepassword/:id", async (req, res) => {
  console.log(req.body);
  console.log(req.params.id);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        password: req.body.password,
      },
    },
    { new: true, runValidators: true }
  );

  console.log("in put change password register");

  // if (error) return res.status(400).send(error.message);

  // let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("no user with this email");
  await user.save();
  res.send(user);
});

router.delete("/:id", auth, admin, validateObjId, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).send("Could not delete the given user");

  res.send(user);
});

module.exports = router;
