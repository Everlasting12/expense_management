const express = require("express");
const router = express.Router();

const auth = require("../middlewears/auth.js");
const validateObjId = require("../middlewears/validateobjectId");
const admin = require("../middlewears/admin");

const {
  validateHousehold,
  HouseHold,
  houseHoldSchema,
} = require("../models/householdsModel.js");
const { User } = require("../models/usersModel");

const app = express();
app.use(express.json());

router.get("/", async (req, res) => {
  const houseHolds = await HouseHold.find();
  if (!houseHolds) return res.status(404).send("HouseHolds not found");
  res.send(houseHolds);
});

router.get("/:id", validateObjId, async (req, res) => {
  const houseHolds = await HouseHold.findById(req.params.id);
  if (!houseHolds) return res.status(404).send("HouseHolds not found");
  res.send(houseHolds);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateHousehold(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let primaryUser = await User.findOne({ _id: req.body.createdBy });
  if (!primaryUser) return res.status(400).send(error.details[0].message);

  try {
    const houseHold = new HouseHold({
      name: req.body.name,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      area: req.body.area,
      city: req.body.city,
      state: req.body.state,
      zipcode: req.body.zipcode,
      createdBy: {
        name: primaryUser.firstName + " " + primaryUser.lastName,
        email: primaryUser.email,
        _id: primaryUser._id,
      },
    });
    await houseHold.save();
    res.status(200).send(houseHold);
  } catch (error) {
    res.status(404).send(error);
  }
});

//added to get household details of that primary user
router.post("/getHouseHold", auth, async (req, res) => {
  const { primaryuserId, titleName } = req.body;
  let query = {};
  query["createdBy._id"] = primaryuserId;

  if (titleName) {
    reg = new RegExp(`^${titleName}`, "i");
    query["name"] = reg;
  }

  const houseHolds = await HouseHold.find(query);
  if (!houseHolds) return res.status(400).send("No data household data found ");
  res.status(200).send(houseHolds);
});

router.put("/:id", auth, validateObjId, async (req, res) => {
  const { error } = validateHousehold(req.body);
  if (error) {
    console.log(error.message);
    return res.status(400).send(error.details[0].message);
  }

  let houseHold = {};
  houseHold = await HouseHold.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        area: req.body.area,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode,
      },
    },
    { new: true, runValidators: true }
  );

  if (!houseHold) return res.status(404).send("given id is not found");
  houseHold.save();
  res.send(houseHold);
});

// router.post("/pfs", auth, async (req, res) => {
//   let { houseHoldName } = req.body;
//   let query = {};
//   let movies = {};
//   if (houseHoldName) {
//     console.log("in pfs api:" + houseHoldName);
//     reg = new RegExp(`^${houseHoldName}`, "i");
//     query["title"] = reg;
//     // movies = await Movie.find({ title: { $regex: "^" + movieTitle } })
//     movies = await Movie.find(query);
//   }
// });
router.delete("/:id", auth, validateObjId, async (req, res) => {
  const houseHold = await HouseHold.findByIdAndDelete(req.params.id);
  if (!houseHold) return res.status(404).send("The given HouseHold not found");
  res.send(houseHold);
});

module.exports = router;
