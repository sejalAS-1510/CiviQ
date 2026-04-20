const express = require("express");
const router = express.Router();
const {
  getOrganizations,
  createOrganization,
} = require("../controllers/organizationController");

// Get all organizations
router.get("/", getOrganizations);

// Create new organization
router.post("/", createOrganization);

module.exports = router;
