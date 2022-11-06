require("express-async-errors"); // to avoid try catch
const winston = require("winston");
const config = require("config");
require("winston-mongodb");

module.exports = function () {
  winston.configure({
    transports: [
      new winston.transports.File({ filename: "error.log" }),
      new winston.transports.Console(),
      new winston.transports.MongoDB({
        db: config.get("Mongo-DB-url"),
        options: { useUnifiedTopology: true },
      }),
    ],
  });

  process.on("uncaughtException", (err) => {
    console.log(
      err,
      "$$$$$$%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
    );
    winston.error("we have got an uncaught error");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });

  process.on("unhandledRejection", () => {
    winston.error("we have got an unhandle promise rejection");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });
};
