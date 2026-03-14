// API Configuration - Use localhost for development
const API_BASE = "http://localhost:5000/api";

// Global state
let currentUser = null;
let authToken = localStorage.getItem("authToken");

// Initialize app
document.addEventListener("DOMContentLoaded", async function () {
  // Test backend connection first
  const backendRunning = await testBackendConnection();

  if (!backendRunning) {
    // Backend is not reachable right now. Just load the dashboard UI without showing
    // a persistent error notification (it can be noisy during dev refresh/reset).
    console.warn(
      "Backend not reachable - UI will load without active API features.",
    );
    loadSection("dashboard");
    return;
  }

  // Check if user is already logged in
  if (authToken) {
    handleAuthenticatedUser().catch((error) => {
      console.warn("Failed to authenticate existing token:", error);
      // Clear invalid token and show login
      localStorage.removeItem("authToken");
      authToken = null;
      loadSection("dashboard");
    });
  } else {
    loadSection("dashboard");
  }
});

// Debug function to test backend connection (call from browser console: testBackendConnection())
window.testBackendConnection = async function () {
  try {
    const response = await fetch("http://localhost:5000/");
    if (response.ok) {
      const text = await response.text();
      console.log("✅ Backend is running:", text);
    } else {
      console.error("❌ Backend responded with status:", response.status);
    }
  } catch (error) {
    console.error("❌ Cannot connect to backend:", error.message);
  }
};

// API Helper Functions
async function testBackendConnection() {
  try {
    const response = await fetch("http://localhost:5000/");
    if (response.ok) {
      console.log("✅ Backend server is running");
      return true;
    }
  } catch (error) {
    console.error("❌ Backend server is not accessible:", error.message);
    return false;
  }
  return false;
}

async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    console.log(`Making API request to: ${API_BASE}${endpoint}`);
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Check if response is HTML (server error)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error(
        `Server returned HTML instead of JSON. Check if backend is running on ${API_BASE}`,
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    if (error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE}. Make sure backend is running.`,
      );
    }
    throw error;
  }
}

// Authentication Functions
async function handleLogin() {
  // Show login modal/form
  showLoginModal();
}

async function loginUser(email, password) {
  try {
    const data = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    authToken = data.data.token;
    currentUser = data.data;
    localStorage.setItem("authToken", authToken);

    showNotification("Login successful!", "success");
    handleAuthenticatedUser();
  } catch (error) {
    console.error("Login failed:", error);
    if (error.message.includes("Invalid email or password")) {
      showNotification(
        "Invalid email or password. Please check your credentials.",
        "error",
      );
    } else if (
      error.message.includes("Server error") ||
      error.message.includes("Server returned HTML")
    ) {
      showNotification(
        "Server error during login. Please try again later.",
        "error",
      );
    } else {
      showNotification("Login failed: " + error.message, "error");
    }
  }
}

async function registerUser(userData) {
  try {
    const data = await apiRequest("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    authToken = data.data.token;
    currentUser = data.data;
    localStorage.setItem("authToken", authToken);

    showNotification("Registration successful!", "success");
    handleAuthenticatedUser();
  } catch (error) {
    console.error("Registration failed:", error);
    if (error.message.includes("User already exists")) {
      showNotification(
        "An account with this email already exists. Please try logging in instead.",
        "error",
      );
    } else if (error.message.includes("Server error")) {
      showNotification(
        "Server error during registration. Please try again later.",
        "error",
      );
    } else {
      showNotification(
        "Registration failed. Please check your information and try again.",
        "error",
      );
    }
  }
}

function logoutUser() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem("authToken");
  location.reload();
}

async function handleAuthenticatedUser() {
  try {
    // Get user profile
    const data = await apiRequest("/users/profile");
    currentUser = data.data;

    // Update UI
    updateUIForAuthenticatedUser();

    // Load appropriate dashboard based on role
    if (currentUser.role === "admin") {
      loadSection("admin_analytics");
    } else if (currentUser.role === "technician") {
      loadSection("authority_dashboard");
    } else {
      loadSection("dashboard");
    }
  } catch (error) {
    // Token might be invalid, logout
    logoutUser();
  }
}

function updateUIForAuthenticatedUser() {
  // Hide login button
  document.getElementById("loginBtn").style.display = "none";

  // Show profile section
  document.getElementById("profile-section").classList.remove("hidden");

  // Update user info
  document.getElementById("user-name").textContent = currentUser.name;
  document.getElementById("user-role").textContent =
    currentUser.role.toUpperCase();

  // Show analytics for admin
  if (currentUser.role === "admin") {
    document.getElementById("nav-analytics").classList.remove("hidden");
  }
}

// Modal Functions
function showLoginModal() {
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  modal.innerHTML = `
        <div class="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
            <h2 class="text-2xl font-serif italic mb-6 text-center text-[#3f4234]">Welcome Back</h2>
            <div id="auth-forms">
                <div id="login-form">
                    <input type="email" id="login-email" placeholder="Email" class="w-full bg-transparent border-b border-gray-300 py-3 mb-4 outline-none focus:border-[#6b705c]">
                    <input type="password" id="login-password" placeholder="Password" class="w-full bg-transparent border-b border-gray-300 py-3 mb-6 outline-none focus:border-[#6b705c]">
                    <button onclick="submitLogin()" class="w-full bg-[#3f4234] text-white py-3 rounded-full font-bold text-sm uppercase tracking-widest mb-4">Sign In</button>
                    <button onclick="switchToRegister()" class="w-full text-[#6b705c] text-sm">New to CiviQ? Create Account</button>
                </div>
                <div id="register-form" class="hidden">
                    <input type="text" id="reg-name" placeholder="Full Name" class="w-full bg-transparent border-b border-gray-300 py-3 mb-4 outline-none focus:border-[#6b705c]">
                    <input type="email" id="reg-email" placeholder="Email" class="w-full bg-transparent border-b border-gray-300 py-3 mb-4 outline-none focus:border-[#6b705c]">
                    <input type="password" id="reg-password" placeholder="Password" class="w-full bg-transparent border-b border-gray-300 py-3 mb-4 outline-none focus:border-[#6b705c]">
                    <select id="reg-role" class="w-full bg-transparent border-b border-gray-300 py-3 mb-4 outline-none focus:border-[#6b705c]">
                        <option value="user">Resident</option>
                        <option value="technician">Technician</option>
                    </select>
                    <button onclick="submitRegister()" class="w-full bg-[#3f4234] text-white py-3 rounded-full font-bold text-sm uppercase tracking-widest mb-4">Create Account</button>
                    <button onclick="switchToLogin()" class="w-full text-[#6b705c] text-sm">Already have an account? Sign In</button>
                </div>
            </div>
            <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;
  document.body.appendChild(modal);
}

function closeModal() {
  const modal = document.querySelector(".fixed.inset-0");
  if (modal) modal.remove();
}

function switchToRegister() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("register-form").classList.remove("hidden");
}

function switchToLogin() {
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("login-form").classList.remove("hidden");
}

function submitLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  loginUser(email, password);
  closeModal();
}

function submitRegister() {
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const role = document.getElementById("reg-role").value;

  if (!name || !email || !password) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  registerUser({ name, email, password, role });
  closeModal();
}

// Notification System
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-full text-sm font-bold z-50 ${
    type === "success"
      ? "bg-green-100 text-green-800"
      : type === "error"
        ? "bg-red-100 text-red-800"
        : "bg-blue-100 text-blue-800"
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Complaint Management
async function submitComplaint(formData) {
  try {
    const data = await apiRequest("/complaints", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    showNotification("Complaint submitted successfully!", "success");
    loadSection("board"); // Redirect to board
  } catch (error) {
    showNotification("Failed to submit complaint", "error");
  }
}

async function loadComplaints() {
  try {
    const data = await apiRequest("/complaints");
    return data.data || [];
  } catch (error) {
    console.error("Failed to load complaints:", error);
    return [];
  }
}

// Page Content (Updated with real functionality)
const pages = {
  // 1. RESIDENT DASHBOARD
  dashboard: `
        <div class="hero-card mb-8">
            <h1 class="text-5xl mb-4 italic">Community <br> Transformation.</h1>
            <p class="opacity-70 max-w-sm mb-6 text-lg">Manage your urban environment with elegance and precision.</p>
            <button onclick="loadSection('report')" class="bg-white text-[#3f4234] px-8 py-3 rounded-full font-bold text-[10px] tracking-widest uppercase hover:bg-[#e2e2da] transition-all">File New Report</button>
        </div>
        <div class="grid grid-cols-3 gap-6" id="dashboard-stats">
            <div class="glass-card text-center">
                <h2 class="text-4xl text-[#6b705c] italic" id="active-issues">0</h2>
                <p class="text-[10px] uppercase tracking-widest opacity-50 font-bold">Active Issues</p>
            </div>
            <div class="glass-card text-center">
                <h2 class="text-4xl text-[#6b705c] italic">85%</h2>
                <p class="text-[10px] uppercase tracking-widest opacity-50 font-bold">Satisfaction</p>
            </div>
            <div class="glass-card text-center">
                <h2 class="text-4xl text-[#6b705c] italic">24h</h2>
                <p class="text-[10px] uppercase tracking-widest opacity-50 font-bold">Avg Response</p>
            </div>
        </div>
    `,

  // 2. DETAILED REPORT PAGE
  report: `
        <h1 class="text-4xl mb-6 italic text-[#3f4234]">New Report</h1>
        <div class="glass-card max-w-3xl">
            <form id="complaint-form" onsubmit="handleComplaintSubmit(event)" class="space-y-6">
                <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Issue Title</label>
                    <input type="text" name="title" placeholder="e.g. Broken Pavement" class="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-[#6b705c]" required>
                </div>
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Category</label>
                        <select name="category" class="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-[#6b705c]" required>
                            <option value="">Select Category</option>
                            <option value="Infrastructure">Infrastructure & Roads</option>
                            <option value="Sanitation">Water & Sanitation</option>
                            <option value="Utilities">Electricity & Power</option>
                            <option value="Safety">Public Safety</option>
                            <option value="Environment">Environment</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Urgency</label>
                        <select name="urgency" class="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-[#6b705c]" required>
                            <option value="Low">Low - Routine</option>
                            <option value="Medium">Medium - Urgent</option>
                            <option value="High">High - Emergency</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Specific Location</label>
                    <input type="text" name="location" placeholder="Landmark or Address" class="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-[#6b705c]" required>
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Detailed Description</label>
                    <textarea name="description" rows="3" class="w-full bg-transparent border border-gray-200 rounded-2xl p-4 mt-2 outline-none focus:border-[#6b705c]" placeholder="Describe the issue in detail..." required></textarea>
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Photo (Optional)</label>
                    <input type="file" name="image" accept="image/*" class="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-[#6b705c]">
                </div>
                <button type="submit" class="w-full bg-[#3f4234] text-white py-4 rounded-full font-bold tracking-[0.2em] text-[10px] uppercase mt-4 hover:bg-[#6b705c] transition-colors">Submit Official Report</button>
            </form>
        </div>
    `,

  // 3. FULLY POPULATED BOARD
  board: `
        <h1 class="text-4xl mb-8 italic text-[#3f4234]">Management Board</h1>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="complaints-board">
            <div class="bg-[#dcdbd2] p-6 rounded-[32px] min-h-[500px] shadow-inner">
                <h3 class="font-serif italic mb-6 text-xl text-[#3f4234]">Reported</h3>
                <div id="reported-complaints" class="space-y-4">
                    <p class="text-gray-500 text-sm">Loading complaints...</p>
                </div>
            </div>

            <div class="bg-[#dcdbd2] p-6 rounded-[32px] min-h-[500px] shadow-inner">
                <h3 class="font-serif italic mb-6 text-xl text-[#3f4234]">In Progress</h3>
                <div id="inprogress-complaints" class="space-y-4">
                    <p class="text-gray-500 text-sm">No complaints in progress</p>
                </div>
            </div>

            <div class="bg-[#dcdbd2] p-6 rounded-[32px] min-h-[500px] shadow-inner">
                <h3 class="font-serif italic mb-6 text-xl text-[#3f4234]">Resolved</h3>
                <div id="resolved-complaints" class="space-y-4">
                    <p class="text-gray-500 text-sm">No resolved complaints</p>
                </div>
            </div>
        </div>
    `,

  // 4. AUTHORITY & TECHNICIAN DASHBOARD
  authority_dashboard: `
        <div class="hero-card mb-8" style="background: #4a4e31;">
            <h1 class="text-5xl mb-4 italic">Operations Control.</h1>
            <p class="opacity-70 max-w-sm mb-6 text-lg">Unit: ${currentUser?.specialization || "General"}. Tasks assigned to you.</p>
        </div>
        <div class="glass-card">
            <h3 class="font-serif italic text-xl mb-4 text-[#6b705c]">Assigned Tasks</h3>
            <div id="assigned-tasks" class="space-y-3">
                <p class="text-gray-500">Loading assigned tasks...</p>
            </div>
        </div>
    `,

  // 5. ADMIN ANALYTICS
  admin_analytics: `
        <h1 class="text-4xl mb-8 italic text-[#3f4234]">System Analytics</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="glass-card">
                <h3 class="font-serif italic text-xl mb-4 text-[#6b705c]">Complaint Statistics</h3>
                <div id="analytics-stats" class="space-y-4">
                    <p class="text-gray-500">Loading statistics...</p>
                </div>
            </div>
            <div class="glass-card">
                <h3 class="font-serif italic text-xl mb-4 text-[#6b705c]">User Management</h3>
                <div id="user-management" class="space-y-4">
                    <p class="text-gray-500">Loading user data...</p>
                </div>
            </div>
        </div>
    `,

  // 6. PROFILE PAGE
  profile: `
        <h1 class="text-4xl mb-6 italic">Identity Settings</h1>
        <div class="glass-card max-w-2xl">
            <form id="profile-form" onsubmit="handleProfileUpdate(event)" class="space-y-4">
                <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Full Name</label>
                    <input type="text" name="name" value="${currentUser?.name || ""}" class="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-[#6b705c]" required>
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Email</label>
                    <input type="email" name="email" value="${currentUser?.email || ""}" class="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-[#6b705c]" required>
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Phone</label>
                    <input type="tel" name="phone" value="${currentUser?.phone || ""}" class="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-[#6b705c]">
                </div>
                <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Address</label>
                    <input type="text" name="address" value="${currentUser?.address || ""}" class="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-[#6b705c]">
                </div>
                <div class="flex gap-4">
                    <button type="submit" class="bg-[#3f4234] text-white px-10 py-3 rounded-full mt-4 font-bold text-[10px] tracking-widest uppercase">Save Changes</button>
                    <button type="button" onclick="logoutUser()" class="border border-[#3f4234] text-[#3f4234] px-10 py-3 rounded-full mt-4 font-bold text-[10px] tracking-widest uppercase hover:bg-[#3f4234] hover:text-white transition-all">Logout</button>
                </div>
            </form>
        </div>
    `,
};

// UI Functions
function toggleSidebar() {
  document.body.classList.toggle("sidebar-open");
}

function loadSection(id) {
  const area = document.getElementById("content-area");
  area.style.opacity = "0";

  setTimeout(() => {
    area.innerHTML = pages[id];
    area.style.opacity = "1";

    // Update Sidebar Active state
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("onclick")?.includes(id))
        btn.classList.add("active");
    });

    // Load section-specific data
    loadSectionData(id);
  }, 150);
}

async function loadSectionData(sectionId) {
  switch (sectionId) {
    case "dashboard":
      await loadDashboardStats();
      break;
    case "board":
      await loadComplaintsBoard();
      break;
    case "authority_dashboard":
      await loadAssignedTasks();
      break;
    case "admin_analytics":
      await loadAnalyticsData();
      break;
  }
}

async function loadDashboardStats() {
  if (!currentUser) return;

  try {
    const complaints = await loadComplaints();
    const userComplaints = complaints.filter(
      (c) => c.userId === currentUser._id,
    );
    document.getElementById("active-issues").textContent =
      userComplaints.length;
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
  }
}

async function loadComplaintsBoard() {
  // Check if user is authenticated
  if (!currentUser) {
    document.getElementById("reported-complaints").innerHTML =
      '<p class="text-gray-500 text-sm">Please log in to view complaints</p>';
    document.getElementById("inprogress-complaints").innerHTML =
      '<p class="text-gray-500 text-sm">Please log in to view complaints</p>';
    document.getElementById("resolved-complaints").innerHTML =
      '<p class="text-gray-500 text-sm">Please log in to view complaints</p>';
    return;
  }

  try {
    const complaints = await loadComplaints();

    const reported = complaints.filter((c) => c.status === "Pending");
    const inProgress = complaints.filter((c) => c.status === "In Progress");
    const resolved = complaints.filter((c) => c.status === "Resolved");

    document.getElementById("reported-complaints").innerHTML =
      renderComplaints(reported);
    document.getElementById("inprogress-complaints").innerHTML =
      renderComplaints(inProgress);
    document.getElementById("resolved-complaints").innerHTML =
      renderComplaints(resolved);
  } catch (error) {
    console.error("Failed to load complaints board:", error);
    // Show error message in the UI
    const errorMsg =
      '<p class="text-red-500 text-sm">Failed to load complaints. Please try again.</p>';
    document.getElementById("reported-complaints").innerHTML = errorMsg;
    document.getElementById("inprogress-complaints").innerHTML = errorMsg;
    document.getElementById("resolved-complaints").innerHTML = errorMsg;
  }
}

function renderComplaints(complaints) {
  if (complaints.length === 0) {
    return '<p class="text-gray-500 text-sm">No complaints found</p>';
  }

  return complaints
    .map(
      (complaint) => `
        <div class="issue-card p-4 bg-white rounded-2xl">
            <div class="flex justify-between items-start mb-2">
                <span class="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded uppercase">${complaint.category}</span>
                <span class="text-[10px] text-gray-500">${new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
            <p class="font-bold mt-1">${complaint.description.substring(0, 50)}...</p>
            <p class="text-[11px] opacity-70">Location: ${complaint.location}</p>
        </div>
    `,
    )
    .join("");
}

async function loadAssignedTasks() {
  if (!currentUser || currentUser.role !== "technician") return;

  try {
    const complaints = await loadComplaints();
    const assignedTasks = complaints.filter(
      (c) => c.technician === currentUser._id,
    );

    const tasksHtml =
      assignedTasks.length > 0
        ? assignedTasks
            .map(
              (task) => `
                <div class="p-4 bg-[#f3f2ed] rounded-2xl flex justify-between items-center">
                    <div>
                        <span class="font-bold">${task.description.substring(0, 30)}...</span>
                        <p class="text-sm text-gray-600">${task.location}</p>
                    </div>
                    <button onclick="updateTaskStatus('${task._id}', 'Resolved')" class="text-[10px] font-bold uppercase bg-[#6b705c] text-white px-4 py-1.5 rounded-full">Complete</button>
                </div>
            `,
            )
            .join("")
        : '<p class="text-gray-500">No assigned tasks</p>';

    document.getElementById("assigned-tasks").innerHTML = tasksHtml;
  } catch (error) {
    console.error("Failed to load assigned tasks:", error);
  }
}

async function loadAnalyticsData() {
  if (!currentUser || currentUser.role !== "admin") return;

  try {
    const complaints = await loadComplaints();
    const users = await apiRequest("/users");

    // Statistics
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(
      (c) => c.status === "Resolved",
    ).length;
    const pendingComplaints = complaints.filter(
      (c) => c.status === "Pending",
    ).length;

    document.getElementById("analytics-stats").innerHTML = `
            <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                    <div class="text-2xl font-bold text-[#6b705c]">${totalComplaints}</div>
                    <div class="text-sm text-gray-600">Total Complaints</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">${resolvedComplaints}</div>
                    <div class="text-sm text-gray-600">Resolved</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-orange-600">${pendingComplaints}</div>
                    <div class="text-sm text-gray-600">Pending</div>
                </div>
            </div>
        `;

    // User management
    document.getElementById("user-management").innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span>Total Users:</span>
                    <span class="font-bold">${users.data.length}</span>
                </div>
                <div class="flex justify-between">
                    <span>Technicians:</span>
                    <span class="font-bold">${users.data.filter((u) => u.role === "technician").length}</span>
                </div>
                <div class="flex justify-between">
                    <span>Residents:</span>
                    <span class="font-bold">${users.data.filter((u) => u.role === "user").length}</span>
                </div>
            </div>
        `;
  } catch (error) {
    console.error("Failed to load analytics:", error);
  }
}

// Form Handlers
async function handleComplaintSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const complaintData = {
    description: formData.get("title") + ": " + formData.get("description"),
    location: formData.get("location"),
    category: formData.get("category"),
  };

  await submitComplaint(complaintData);
}

async function handleProfileUpdate(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const profileData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  };

  try {
    await apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    showNotification("Profile updated successfully!", "success");
    // Refresh user data
    await handleAuthenticatedUser();
  } catch (error) {
    showNotification("Failed to update profile", "error");
  }
}

async function updateTaskStatus(complaintId, status) {
  try {
    await apiRequest(`/complaints/${complaintId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });

    showNotification("Task status updated!", "success");
    loadSection("authority_dashboard"); // Refresh the dashboard
  } catch (error) {
    showNotification("Failed to update task status", "error");
  }
}

// Initialize app
window.onload = () => {
  if (authToken) {
    handleAuthenticatedUser();
  } else {
    loadSection("dashboard");
  }
};
