const express = require("express");
const router = express.Router();

const { User, userSchema, validateUser } = require("../models/usersModel");

router.get("/", async (req, res) => {
  const users = await User.find({});
  res.status(200).send(users);
});
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  try {
    const user = new User({
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
    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.put("/:id", async (req, res) => {});

module.exports = router;
