const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const { forwardAuthenticated } = require("../middleware/auth");

router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login");
});

router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "please fill in all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "the password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email });
  } else {
    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        errors.push({ msg: "user is already registered" });
        res.render("register", { errors, name, email });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        await newUser.save();
        req.flash("success_msg", "you are now registered and can log in");
        res.redirect("/login");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("server error");
    }
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "you are loged out");
  res.redirect("/login");
});

module.exports = router;
