const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    const { description, location } = req.body;

    const complaint = new Complaint({
      description,
      location,
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
};
