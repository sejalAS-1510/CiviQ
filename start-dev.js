#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting CiviQ Development Environment...\n");

// Start backend server
console.log("📡 Starting backend server...");
const backendProcess = spawn("npm", ["start"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  shell: true,
});

backendProcess.on("error", (err) => {
  console.error("❌ Failed to start backend:", err);
});

backendProcess.on("close", (code) => {
  if (code !== 0) {
    console.log(`⚠️  Backend exited with code ${code}`);
  }
});

// Wait a bit then start frontend
setTimeout(() => {
  console.log("\n🌐 Starting frontend server...");
  const frontendProcess = spawn("python", ["-m", "http.server", "5501"], {
    cwd: path.join(__dirname, "frontend"),
    stdio: "inherit",
    shell: true,
  });

  frontendProcess.on("error", (err) => {
    console.error("❌ Failed to start frontend:", err);
  });

  console.log("\n✅ Both servers started!");
  console.log("📱 Frontend: http://localhost:5501");
  console.log("🔧 Backend: http://localhost:5000");
  console.log("\n💡 Test login with: test@example.com / password123");
  console.log("🛑 Press Ctrl+C to stop both servers\n");
}, 3000);

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down servers...");
  backendProcess.kill();
  process.exit(0);
});
