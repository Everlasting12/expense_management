const mongoose = require("mongoose");
const Joi = require("joi");
const { string } = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const Schema = mongoose.Schema;

const periodicPaymentsSchema = new Schema({
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
  frequency: {
    type: String, //month,yearly
    minLength: [3, "frequency should be atleast 3 characters long"],
    maxLength: [20, "frequency should be atmost 20 characters long"],
    required: true,
  },
  amount: {
    type: Number, //
    required: true,
  },
  dueDate: {
    type: Date, //in month
    required: true,
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

  // type: Array, //[{1299.00, 2020-02-20,netbanking,}{1299.00,2021-01-21,upi}]
  /*paymentDetails: {
   
  }, */

  paymentDetails: [
    {
      amount: {
        type: Number,
      },
      date: {
        type: Date,
        default: Date.now(),
      },
      method: {
        type: String,
        required: true,
      },
    },
  ],
  // required: true,

  description: {
    type: String,
    minLength: [3, "should be atleast 3 characters long"],
    maxLength: [20, "description should be atmost 20 characters long"],
    // required: true,
  },
  paidThrough: {
    type: String,
    minLength: [5, " should be atleast 5 characters long"],
    maxLength: [30, "should be atmost 30 characters long"],
    // require: true,
  },

  paidBy: {
    type: Array,
    // required: true,
  },
});

const PeriodicPayments = mongoose.model(
  "periodicPayment",
  periodicPaymentsSchema
);

function validatePeriodicPayments(PeriodicPayments) {
  const schema = Joi.object({
    householdId: Joi.string(),
    frequency: Joi.string(),
    amount: Joi.number(),
    dueDate: Joi.date(),
    expensetypeId: Joi.string(),
    paymentDetails: Joi.array(),
    // paymentDetails: Joi.array([
    //   { amount: Joi.number(), date: Joi.date(), method: Joi.string() },
    // ]),
    description: Joi.string().min(3).max(20),
    paidThrough: Joi.string().min(3).max(20),
    paidBy: Joi.array(),
  });
  return schema.validate(PeriodicPayments);
}

module.exports = {
  validatePeriodicPayments,
  periodicPaymentsSchema,
  PeriodicPayments,
};
