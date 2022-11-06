const express = require("express");

const {
  periodicPaymentsSchema,
  PeriodicPayments,
  validatePeriodicPayments,
  validatePeriodicPaymentsforUpdate,
} = require("../models/periodicpaymentsModel");

const { HouseHold } = require("../models/householdsModel");
const { ExpenseType } = require("../models/expenseTypeModel");
const { HouseHoldExpense } = require("../models/houseHoldExpensesModel");

const auth = require("../middlewears/auth.js");
const validateObjId = require("../middlewears/validateobjectId");
const admin = require("../middlewears/admin");

const router = express.Router();

const app = express();
app.use(express.json());

router.get("/", async (req, res) => {
  console.log("in get periodic");
  const periodicPayments = await PeriodicPayments.find();
  if (!periodicPayments)
    return res.status(404).send("PeriodicPayments are not found");
  res.send(periodicPayments);
});

router.get("/:id", auth, async (req, res) => {
  const periodicPayments = await PeriodicPayments.findById(req.params.id);

  if (!periodicPayments)
    return res.status(404).send("periodicPayments are not found");
  res.send(periodicPayments);
});
///--for pfs
router.post("/pfs", auth, async (req, res) => {
  let { titleName, lastDate } = req.body;
  let query = {};
  let query2 = {};
  if (titleName) {
    console.log("in pfs api:" + titleName);
    reg = new RegExp(`^${titleName}`, "i");
    query["expensetype.name"] = reg;
    query2["household.name"] = reg;
    // {dueDate:{$gt:ISODate("2022-11-26"),$lte: ISODate("2022-11-2")}}
  }
  let queryDate = {};
  queryDate[`paymentDetails[0]`];
  // console.log("in post periodic get");

  // const checkPd = await PeriodicPayments.find({
  //   "paymentDetails.date": { $gt: "2022-10-26", $lte: "2022-10-31" },
  // });
  // console.log(checkPd.length);
  // console.log(checkPd);

  const periodicPayments = await PeriodicPayments.find({
    $or: [query, query2],
  });
  if (!periodicPayments)
    return res.status(404).send("PeriodicPayments are not found");
  res.send(periodicPayments);
});

router.post("/", auth, async (req, res) => {
  const { error } = validatePeriodicPayments(req.body);
  if (error) {
    console.log(error.message);
    return res.status(400).send(error.details[0].message);
  }

  const houseHold = await HouseHold.findById(req.body.householdId);
  if (!houseHold) return res.status(404).send("HouseHolds not found");

  const expensetype = await ExpenseType.findById(req.body.expensetypeId);
  if (!expensetype) return res.status(404).send("expensetype not found");

  if (!req.body.paymentDetails) {
    req.body.paymentDetails = [];
  }
  const paymentDetailsArr = req.body.paymentDetails.map((val) => val);

  const periodicPayments = new PeriodicPayments({
    household: {
      _id: houseHold._id,
      name: houseHold.name,
    },
    expensetype: {
      _id: expensetype._id,
      name: expensetype.name,
    },
    paymentDetails: paymentDetailsArr,
    description: req.body.description,
    // paidThrough: req.body.paidThrough,
    // paidBy: req.body.paidBy,
    frequency: req.body.frequency,
    amount: req.body.amount,
    dueDate: req.body.dueDate,
  });

  await periodicPayments.save();
  res.send(periodicPayments);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validatePeriodicPaymentsforUpdate(req.body);
  if (error) {
    console.log(error.message);
    return res.status(400).send(error.details[0].message);
  }

  let paymentUpdate = {};

  paymentUpdate = await PeriodicPayments.findById(req.params.id);
  if (!paymentUpdate) return res.status(404).send("given id is not found");

  let paymentDetailsArr = [
    ...paymentUpdate.paymentDetails,
    req.body.paymentDetails,
  ]; //[{},{},{}]
  let paidby = [...paymentUpdate.paidBy, req.body.paidBy]; //["omk","mau"]
  let paidthrough = [...paymentUpdate.paidThrough, req.body.paidThrough];

  let periodicPayments = await PeriodicPayments.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        dueDate: req.body.dueDate,
        paymentDetails: paymentDetailsArr,
        // description: req.body.description,
        paidThrough: paidthrough,
        paidBy: paidby,
        // updatedBy: req.body.updatedBy,
      },
    },
    { new: true, runValidators: true }
  );
  await periodicPayments.save();
  res.send(periodicPayments);
});

router.delete("/:id", validateObjId, async (req, res) => {
  const periodicPayments = await PeriodicPayments.findByIdAndDelete(
    req.params.id
  );

  if (!periodicPayments)
    return res.status(404).send("The given periodicPaymentss not found");
  res.send(periodicPayments);
});

module.exports = router;
