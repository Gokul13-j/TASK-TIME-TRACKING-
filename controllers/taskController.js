const Task = require("../models/Task");
const TimeLog = require("../models/TimeLog");

const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      createdBy: req.user.id
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await TimeLog.deleteMany({ taskId: req.params.id, userId: req.user.id });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getDashboard = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id });
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const timeLogs = await TimeLog.find({ userId: req.user.id });
    const totalDuration = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

    res.json({
      totalTasks: tasks.length,
      completedTasks,
      totalDurationSeconds: totalDuration
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getDashboard };
