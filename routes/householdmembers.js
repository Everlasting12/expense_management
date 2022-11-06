const express = require("express");
const router = express.Router();

const {
  validateHousehold,
  HouseHold,
  houseHoldSchema,
} = require("../models/householdsModel.js");
const { User, userSchema, validateUser } = require("../models/usersModel");
const {
  validatehouseHoldmembers,
  Householdmember,
  householdmembersSchema,
} = require("../models/householdmembersModel.js");

const auth = require("../middlewears/auth.js");
const validateObjId = require("../middlewears/validateobjectId");
const admin = require("../middlewears/admin");

const app = express();
app.use(express.json());

router.get("/", async (req, res) => {
  const householdmembers = await Householdmember.find();
  if (!householdmembers)
    return res.status(404).send("HouseHoldsmember not found");

  res.send(householdmembers);
});

router.get("/:id", validateObjId, async (req, res) => {
  const householdmember = await Householdmember.findById(req.params.id);
  if (!householdmember)
    return res.status(404).send("HouseHoldsmember not found");

  res.send(householdmember);
});

router.get("/getHouseHoldsForMember/:id", validateObjId, async (req, res) => {
  console.log(req.params.id);
  let query = {};
  query["user._id"] = req.params.id;
  // console.log(query);
  const householdmember = await Householdmember.find(query);
  if (!householdmember)
    return res.status(404).send("HouseHoldsmember not found");

  res.send(householdmember);
});

router.post("/", auth, async (req, res) => {
  const { error } = validatehouseHoldmembers(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const houseHold = await HouseHold.findById(req.body.householdId);
  if (!houseHold) return res.status(404).send("houseHold not found");

  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).send("user not found");

  let query = {};
  query["user._id"] = user._id;
  let query2 = {};
  query2["houseHold._id"] = houseHold._id;
  const chekcHouseholdmember = await Householdmember.find(query);
  // console.log(chekcHouseholdmember);
  chekcHouseholdmember.forEach((ch) => {
    console.log(ch.houseHold._id + "==" + houseHold._id);
    if (ch.houseHold._id.toString() == houseHold._id.toString()) {
      // console.log(ch);
      return res.status(400).send("household member already exist");
    }
  });

  const householdmember = new Householdmember({
    houseHold: {
      _id: houseHold._id,
      name: houseHold.name,
    },
    user: {
      _id: user._id,
      userName: user.firstName + " " + user.lastName,
    },
  });

  await householdmember.save();
  res.send(householdmember);
});

router.post("/getHouseHoldMembers", auth, async (req, res) => {
  const { houseHoldId } = req.body;
  let query = {};
  query["houseHold._id"] = houseHoldId;
  const houseHoldmember = await Householdmember.find(query);
  console.log("in household getHouseHoldMembers api");
  if (!houseHoldmember)
    return res.status(400).send("No data household member data found ");

  res.status(200).send(houseHoldmember);
});
// --------------pfs----------------
router.post("/pfs", auth, async (req, res) => {
  let { houseHoldName } = req.body;
  let query = {};
  let query2 = {};
  if (houseHoldName) {
    console.log("in pfs api:" + houseHoldName);
    reg = new RegExp(`^${houseHoldName}`, "i");
    query["houseHold.name"] = reg;
    query2["user.userName"] = reg;
  }
  const householdmembers = await Householdmember.find({ $or: [query, query2] });
  if (!householdmembers)
    return res.status(404).send("HouseHoldsmember not found");

  res.send(householdmembers);
});

router.put("/:id", async (req, res) => {
  const houseHold = await HouseHold.findById(req.body.householdId);
  if (!houseHold) return res.status(404).send("houseHold not found");

  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).send("user not found");

  let householdmember = await Householdmember.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        houseHold: {
          _id: houseHold._id,
          name: houseHold.name,
        },
        user: {
          _id: user._id,
          userName: user.firstName + " " + user.lastName,
        },
      },
    },
    { new: true, runValidators: true }
  );
  if (!householdmember) return res.status(404).send("Given id is not found");

  res.send(householdmember);
});

router.delete("/:id", validateObjId, async (req, res) => {
  const householdmember = await Householdmember.findByIdAndDelete(
    req.params.id
  );

  if (!householdmember)
    return res.status(404).send("The given householdmembers not found");
  res.send(householdmember);
});

module.exports = router;
