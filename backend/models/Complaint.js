const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  // Track all technicians who have rejected this complaint for exclusion in reassignment
  rejectedTechnicianIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  description: {
    type: String,
    required: [true, "Please add a description"],
    trim: true,
  },

  location: {
    type: String,
    required: [true, "Please add a location"],
    trim: true,
  },

  category: {
    type: String,
    enum: [
      "Plumbing",
      "Electrical",
      "Cleaning",
      "Security",
      "Infrastructure",
      "Noise",
      "General",
      // Legacy categories retained for existing records
      "Sanitation",
      "Utilities",
      "Safety",
      "Environment",
    ],
    default: "General",
  },

  primaryCategory: {
    type: String,
    enum: [
      "Plumbing",
      "Electrical",
      "Cleaning",
      "Security",
      "Infrastructure",
      "Noise",
      "General",
    ],
    default: "General",
  },

  secondaryCategory: {
    type: String,
    enum: [
      "Plumbing",
      "Electrical",
      "Cleaning",
      "Security",
      "Infrastructure",
      "Noise",
      "General",
    ],
  },

  classificationConfidence: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "low",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },

  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved", "Closed"],
    default: "Pending",
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },

  images: [
    {
      type: String, // URLs to uploaded images
    },
  ],

  // Optional: If admin reports on behalf of a resident
  residentName: {
    type: String,
    trim: true,
    maxlength: [50, "Resident name cannot be more than 50 characters"],
  },
  residentEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      "Please add a valid email",
    ],
  },

  assignedAt: {
    type: Date,
  },

  technicianDecision: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Rescheduled"],
    default: "Pending",
  },

  technicianDecisionAt: {
    type: Date,
  },

  technicianDecisionNote: {
    type: String,
    trim: true,
    maxlength: [300, "Decision note cannot be more than 300 characters"],
  },

  scheduledFor: {
    type: Date,
  },

  resolvedAt: {
    type: Date,
  },

  // Multiple ratings/feedbacks per complaint (admin/resident)
  ratings: [
    {
      rater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["admin", "resident"],
        required: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      feedback: {
        type: String,
        trim: true,
        maxlength: [500, "Feedback cannot be more than 500 characters"],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Deprecated: single rating/feedback fields (for migration/compat)
  technicianRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  technicianFeedback: {
    type: String,
    trim: true,
    maxlength: [500, "Feedback cannot be more than 500 characters"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps and lifecycle fields before saving
ComplaintSchema.pre("save", function () {
  this.updatedAt = Date.now();

  if (!this.primaryCategory) {
    this.primaryCategory = this.category || "General";
  }

  // Reset assignment decision lifecycle when technician assignment changes.
  if (this.isModified("technician")) {
    if (this.technician) {
      if (!this.assignedAt) {
        this.assignedAt = Date.now();
      }

      this.technicianDecision = "Pending";
      this.technicianDecisionAt = undefined;
      this.technicianDecisionNote = undefined;
      this.scheduledFor = undefined;
    }
  }

  // Set resolvedAt when status changes to resolved
  if (
    this.isModified("status") &&
    this.status === "Resolved" &&
    !this.resolvedAt
  ) {
    this.resolvedAt = Date.now();
  }
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
