const express = require("express");

const {
  validateHouseHoldExpense,
  HouseHoldExpense,
  houseHoldExpenseSchema,
} = require("../models/houseHoldExpensesModel");

const auth = require("../middlewears/auth.js");
const validateObjId = require("../middlewears/validateobjectId");
const admin = require("../middlewears/admin");

const { HouseHold } = require("../models/householdsModel");
const { ExpenseType } = require("../models/expenseTypeModel");
const router = express.Router();

const app = express();
app.use(express.json());

router.get("/", async (req, res) => {
  const houseHoldExpenses = await HouseHoldExpense.find();

  if (!houseHoldExpenses)
    return res.status(404).send("houseHoldExpenses are not found");
  res.send(houseHoldExpenses);
});

router.get("/:id", async (req, res) => {
  const houseHoldExpense = await HouseHoldExpense.findById(req.params.id);

  if (!houseHoldExpense)
    return res.status(404).send("houseHoldExpense are not found");
  res.send(houseHoldExpense);
});
//--------------------------pfs------------------------------------------------
router.post("/pfs", auth, async (req, res) => {
  let { titleName } = req.body;
  let query = {};
  let query2 = {};
  let reg;
  if (titleName) {
    console.log("in pfs api:" + titleName);
    reg = new RegExp(`^${titleName}`, "i");
    query["household.name"] = reg;
    query2["expensetype.name"] = reg;
  }
  const houseHoldExpenses = await HouseHoldExpense.find({
    $or: [query, query2],
  });

  if (!houseHoldExpenses)
    return res.status(404).send("houseHoldExpenses are not found");
  res.send(houseHoldExpenses);
});

router.post("/", async (req, res) => {
  const { error } = validateHouseHoldExpense(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const houseHold = await HouseHold.findById(req.body.householdId);
  if (!houseHold) return res.status(404).send("HouseHolds not found");

  const expensetype = await ExpenseType.findById(req.body.expensetypeId);
  if (!expensetype) return res.status(404).send("expensetype not found");

  const houseHoldExpense = new HouseHoldExpense({
    household: {
      _id: houseHold._id,
      name: houseHold.name,
    },
    expensetype: {
      _id: expensetype._id,
      name: expensetype.name,
    },
    paymentDetails: {
      amount: req.body.paymentDetails.amount,
      date: req.body.paymentDetails.date,
      method: req.body.paymentDetails.method,
    },
    description: req.body.description,
    paidThrough: req.body.paidThrough,
    paidBy: req.body.paidBy,
  });

  await houseHoldExpense.save();
  res.send(houseHoldExpense);
});

router.delete("/:id", async (req, res) => {
  const houseHoldExpense = await HouseHoldExpense.findByIdAndDelete(
    req.params.id
  );

  if (!houseHoldExpense)
    return res.status(404).send("givnen id houseHoldexpense is not found");

  res.send(houseHoldExpense);
});

module.exports = router;
