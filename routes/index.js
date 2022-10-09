require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const { hashSync, compareSync } = require("bcrypt");
const User = require("../schema/User");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res, next) => {
  const user = await User.findOne({
    username: req.body.username,
  });
  if (!user) {
    return res.status(401).send({
      success: false,
      message: "Could not find the user",
    });
  }
  if (!compareSync(req.body.password, user.password)) {
    return res.status(401).send({
      success: false,
      message: "Incorrect password",
    });
  }
});

router.post("/signup", (req, res, next) => {
  const user = new User({
    username: req.body.username,
    password: hashSync(req.body.password, 10),
  });

  user
    .save()
    .then((user) => {
      res.send({
        success: true,
        message: "User created successfully",
        user: {
          id: user._id,
          username: user.username,
        },
      });
    })
    .catch((err) => {
      res.send({
        success: false,
        message: "User not created",
        error: err,
      });
    });
  const payload = {
    username: user.username,
    id: user._id,
  };
  const token = jwt.sign(payload, process.env.secretKey, { expiresIn: "1d" });

  return res.status(201).send({
    message: "Logged in succesfully",
    token: "BEARER " + token,
  });
});

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.status(200).send({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
      },
    });
  }
);

module.exports = router;
