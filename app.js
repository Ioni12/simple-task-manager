const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressEjsLayout = require("express-ejs-layouts");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
require("dotenv").config();

require("./config/passport")(passport);

const Task = require("./models/Task");

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(expressEjsLayout);
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.set("view engine", "ejs");
app.set("layout", "layout");

app.use("/", require("./routes/tasks"));
app.use("/", require("./routes/auth"));

const port = process.env.PORT;
app.listen(port, () => console.log("server up"));
