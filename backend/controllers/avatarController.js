const path = require("path");
const fs = require("fs");
const User = require("../models/User");

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    // Remove old avatar if exists and is not default
    const user = await User.findById(req.user._id);
    if (
      user.avatar &&
      user.avatar.startsWith("/uploads/avatars/") &&
      fs.existsSync(path.join(__dirname, "..", user.avatar))
    ) {
      fs.unlinkSync(path.join(__dirname, "..", user.avatar));
    }
    // Save new avatar path
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    res.json({ success: true, avatar: user.avatar });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
