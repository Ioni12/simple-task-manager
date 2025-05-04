const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressEjsLayout = require("express-ejs-layouts");
require("dotenv").config();

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

app.set("view engine", "ejs");
app.set("layout", "layout");

app.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.render("index", { tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const newTask = new Task({
      title: req.body.title,
    });
    await newTask.save();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

app.delete("/tasks/:id", async () => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

app.patch("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    task.completed = !task.completed;
    await task.save();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

const port = process.env.PORT;
app.listen(port, () => console.log("server up"));
