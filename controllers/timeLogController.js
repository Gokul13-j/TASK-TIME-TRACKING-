const TimeLog = require("../models/TimeLog");
const Task = require("../models/Task");

const startTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ message: "Task ID is required" });

    const task = await Task.findOne({ _id: taskId, createdBy: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const runningLog = await TimeLog.findOne({
      taskId,
      userId: req.user.id,
      endTime: { $exists: false }
    });
    if (runningLog) return res.status(400).json({ message: "Timer already running" });

    const log = await TimeLog.create({
      taskId,
      userId: req.user.id,
      startTime: new Date()
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const stopTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ message: "Task ID is required" });

    const log = await TimeLog.findOne({
      taskId,
      userId: req.user.id,
      endTime: { $exists: false }
    }).sort({ createdAt: -1 });

    if (!log) return res.status(404).json({ message: "No running timer found" });

    const endTime = new Date();
    const duration = Math.floor((endTime - log.startTime) / 1000);
    log.endTime = endTime;
    log.duration = duration;
    await log.save();

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTimeLogs = async (req, res) => {
  try {
    const logs = await TimeLog.find({ userId: req.user.id })
      .populate("taskId", "title")
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { startTimer, stopTimer, getTimeLogs };
