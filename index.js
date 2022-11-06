const express = require("express");
// require("express-async-errors");
const app = express();

//requiring the database methods from start/db file
const {
  establishDatabaseConnection,
  closeDatabaseConnection,
} = require("./start/db");
// requiring the PORT number from the start/port file
const { getPort } = require("./start/port");
const { getAllRoutes } = require("./start/routes");

app.use(express.json());

//established the database connection to MongoDB
establishDatabaseConnection();

//db
require("./start/cors")(app);

require("./start/logging")();
//-->
// require("./startup/login")();

//import jwt file ,confi

// getting all routes defined in start/routes file
getAllRoutes(app);

// PORT number to listen to
getPort(app);
