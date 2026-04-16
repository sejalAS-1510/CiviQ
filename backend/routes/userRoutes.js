const express = require("express");
const router = express.Router();

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

// Public routes
router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteMyAccount);

// Admin only routes
router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserById);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
