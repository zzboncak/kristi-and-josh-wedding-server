require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV, CLIENT_ORIGIN } = require("./config");
const invitesRouter = require("./invites/invites-router");
const peopleRouter = require("./people/people-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

const corsOptions = {
  origin: function(origin, callback) {
    if(CLIENT_ORIGIN.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  }
}

app.use(morgan(morganOption));
app.use(cors(corsOptions));
app.use(helmet());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/api/invites", invitesRouter);
app.use("/api/people", peopleRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
