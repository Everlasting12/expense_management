const express = require("express");

const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { User, userSchema } = require("../models/usersModel");
// const loadsh=require("loa")

router.post("/", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  //check isActive status
  if (!user) return res.status(400).send("invalid email");

  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) {
    // throw new error("In valid password");
    return res.status(400).send("Invalid password");
  }

  const token = user.getAuthToken(); //-
  console.log(token);
  // console.log(token);
  // res.send(isValid);
  res.send(token);
});

function validateLogin(data) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(data);
}

module.exports = router;
