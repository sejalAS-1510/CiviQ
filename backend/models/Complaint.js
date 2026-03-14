const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  category: {
    type: String,
  },

  technician: {
    type: String,
  },

  status: {
    type: String,
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
