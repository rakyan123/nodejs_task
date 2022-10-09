require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const { hashSync, compareSync } = require("bcrypt");
const User = require("../schema/User");
const jwt = require("jsonwebtoken");
const Task = require("../schema/Task");

router.post("/login", async (req, res) => {
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

router.post("/signup", (req, res) => {
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

router.post("/task/create", (req, res) => {
  const { title, description, deadline } = req.body;

  const task = new Task({
    title,
    description,
    deadline,
  });

  task
    .save()
    .then((task) => {
      return res.status(201).send({
        success: true,
        message: "Task created",
      });
    })
    .catch((err) => {
      return res.send({
        success: false,
        message: "Task not created",
      });
    });
});

router.get("/task/all", (req, res) => {
  Task.find({})
    .then((tasks) => {
      return res.json({
        tasks: tasks.map((task) => task.toObject({ getters: true })),
      });
    })
    .catch((err) => {
      return res.json({
        success: false,
        message: "Some error occured while getting",
      });
    });
});

router.patch("/task/:id", (req, res) => {
  const { title, description, deadline } = req.body;
  const id = req.params.id;
  Task.findById({ id: id })
    .then((task) => {
      task.title = title;
      task.description = description;
      task.deadline = deadline;

      task
        .save()
        .then((task) => {
          return res.json({
            succes: true,
            message: "Updated task",
            task: task,
          });
        })
        .catch((err) => {
          return res.json({
            success: false,
            message: "Failed to update",
          });
        });
    })
    .catch((err) => {
      return res.json({
        success: false,
        message: "Could not find the task",
      });
    });
});

router.delete("/task/:id", (req, res) => {
  const id = req.params.id;
  Task.findById({ id: id })
    .then((task) => {
      Task.remove(task)
        .then(() => {
          return res.json({
            succes: true,
            message: "Deleted task",
          });
        })
        .catch((err) => {
          return res.json({
            success: false,
            message: "Not able to delete the task",
          });
        });
    })
    .catch((err) => {
      return res.json({
        success: false,
        message: "Could not find the task",
      });
    });
});
module.exports = router;
