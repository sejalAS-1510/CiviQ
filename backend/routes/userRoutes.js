const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const avatarController = require("../controllers/avatarController");

const {
  register,
  login,
  getProfile,
  updateProfile,
  deleteMyAccount,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const {
  forgotPassword,
  resetPassword,
} = require("../controllers/passwordResetController");

const { protect, admin } = require("../middleware/authMiddleware");

// Configure multer for avatar uploads
const avatarUploadsDir = path.join(__dirname, "..", "uploads", "avatars");
if (!require("fs").existsSync(avatarUploadsDir)) {
  require("fs").mkdirSync(avatarUploadsDir, { recursive: true });
}
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const avatarFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Public routes
router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteMyAccount);

// Avatar upload route
router.post(
  "/avatar",
  protect,
  avatarUpload.single("avatar"),
  avatarController.uploadAvatar,
);

// Admin only routes
router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserById);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
