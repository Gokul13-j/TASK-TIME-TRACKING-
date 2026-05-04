const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeLog", timeLogSchema);
