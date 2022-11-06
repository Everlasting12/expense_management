const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const Schema = mongoose.Schema;

const houseHoldExpenseSchema = new Schema({
  household: {
    type: new Schema({
      name: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
      },
    }),
  },
  expensetype: {
    type: new Schema({
      name: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
      },
    }),
  },
  paymentDetails: {
    amount: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    method: {
      type: String,
      minLength: 3,
      maxLength: 50,
      // required: true,
    },
    // required: true,
  },

  description: {
    type: String,
    minLength: [3, "should be atleast 3 characters long"],
    maxLength: [200, "description should be atmost 20 characters long"],
    required: true,
  },
  paidThrough: {
    type: String,
    minLength: [2, " should be atleast 5 characters long"],
    maxLength: [30, "should be atmost 30 characters long"],
    require: true,
  },

  paidBy: {
    type: String,
    minLength: [3, " should be atleast 3 characters long"],
    maxLength: [25, " should be atmost 25 characters long"],
    required: true,
  },
});

const HouseHoldExpense = mongoose.model(
  "houseHoldExpense",
  houseHoldExpenseSchema
);

function validateHouseHoldExpense(HouseHoldExpense) {
  const schema = Joi.object({
    householdId: Joi.objectId(),
    expensetypeId: Joi.objectId(),
    paymentDetails: {
      amount: Joi.number(),
      date: Joi.date(),
      method: Joi.string().min(3).max(20),
    },
    description: Joi.string().min(3).max(200).required(),
    paidThrough: Joi.string().min(2).max(20).required(),
    paidBy: Joi.string(),
  });
  return schema.validate(HouseHoldExpense);
}

module.exports = {
  validateHouseHoldExpense,
  HouseHoldExpense,
  houseHoldExpenseSchema,
};
