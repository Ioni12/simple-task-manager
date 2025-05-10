const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { ensureAuthenticated } = require("../middleware/auth");

router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.render("index", {
      tasks,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST - Add a new task
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const newTask = new Task({
      title: req.body.title,
      user: req.user.id,
    });
    await newTask.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// DELETE - Remove a task
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // Check task exists
    if (!task) {
      return res.status(404).send("Task not found");
    }

    // Check user owns this task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).send("Not authorized");
    }

    await Task.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// PATCH - Toggle task completion
router.patch("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // Check task exists
    if (!task) {
      return res.status(404).send("Task not found");
    }

    // Check user owns this task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).send("Not authorized");
    }

    task.completed = !task.completed;
    await task.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
