const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add an organization name"],
    unique: true,
    trim: true,
    maxlength: [100, "Organization name cannot be more than 100 characters"],
  },
  address: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Organization", OrganizationSchema);
