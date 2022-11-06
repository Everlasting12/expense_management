const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

// const { houseHoldSchema } = require("./householdsModel");
// const { userSchema } = require("./usersModel");

const Schema = mongoose.Schema;

const householdmembersSchema = new Schema({
  houseHold: {
    type: new Schema({
      name: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
      },
    }),
    required: true,
  },
  user: {
    type: new Schema({
      userName: {
        type: String,
        minLength: [5, "Username should be atleast 5 characters long"],
        maxLength: [100, "Username should be atmost 255 characters long"],
        required: true,
      },
    }),
    required: true,
  },
});

const Householdmember = mongoose.model(
  "householdmember",
  householdmembersSchema
);

function validatehouseHoldmembers(householdmembers) {
  const schema = Joi.object({
    householdId: Joi.string(),
    userId: Joi.string(),
  });
  return schema.validate(householdmembers);
}

module.exports = {
  validatehouseHoldmembers,
  Householdmember,
  householdmembersSchema,
};
