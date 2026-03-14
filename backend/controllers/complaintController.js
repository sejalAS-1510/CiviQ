const Complaint = require("../models/Complaint");

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
  try {
    const { description, location, category } = req.body;

    const complaintData = {
      description,
      location,
      category: category || "General",
      userId: req.user._id, // Associate with logged-in user
    };

    // Handle file upload if present
    if (req.file) {
      complaintData.images = [`/uploads/issue-images/${req.file.filename}`];
    }

    const complaint = new Complaint(complaintData);
    await complaint.save();

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    // If there was an error and a file was uploaded, clean it up
    if (req.file) {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "issue-images",
        req.file.filename,
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error during complaint creation",
    });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === "user") {
      query.userId = req.user._id;
    } else if (req.user.role === "technician") {
      // Technicians see complaints in their category or assigned to them
      query.$or = [
        { category: req.user.specialization },
        { technician: req.user._id },
      ];
    }
    // Admins see all complaints

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("technician", "name email specialization");

    res.json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("technician", "name email phone specialization");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Check if user has permission to view this complaint
    if (
      req.user.role === "user" &&
      complaint.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this complaint",
      });
    }

    res.json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error("Get complaint error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Check permissions
    if (
      req.user.role === "user" &&
      complaint.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this complaint",
      });
    }

    // Update allowed fields based on role
    const allowedUpdates = {};
    const updates = req.body;

    if (req.user.role === "user") {
      // Users can only update description and location
      if (updates.description) allowedUpdates.description = updates.description;
      if (updates.location) allowedUpdates.location = updates.location;
    } else if (req.user.role === "technician" || req.user.role === "admin") {
      // Technicians and admins can update status and assign technicians
      if (updates.status) allowedUpdates.status = updates.status;
      if (updates.technician) allowedUpdates.technician = updates.technician;
      if (updates.category) allowedUpdates.category = updates.category;
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true },
    )
      .populate("userId", "name email")
      .populate("technician", "name email specialization");

    res.json({
      success: true,
      message: "Complaint updated successfully",
      data: updatedComplaint,
    });
  } catch (error) {
    console.error("Update complaint error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Only admins can delete complaints
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete complaints",
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Delete complaint error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Assign technician to complaint
// @route   PUT /api/complaints/:id/assign
// @access  Private/Admin
exports.assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Check if user has permission to assign
    if (req.user.role !== "admin" && req.user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to assign technicians",
      });
    }

    complaint.technician = technicianId;
    complaint.status = "In Progress";
    await complaint.save();

    const updatedComplaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email")
      .populate("technician", "name email specialization");

    res.json({
      success: true,
      message: "Technician assigned successfully",
      data: updatedComplaint,
    });
  } catch (error) {
    console.error("Assign technician error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
