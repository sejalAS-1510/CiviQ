// Complaint management functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize complaint form if it exists
  const complaintForm = document.querySelector("form");
  if (complaintForm) {
    complaintForm.addEventListener("submit", handleComplaintSubmit);
  }

  // Load complaints if on dashboard
  if (document.querySelector(".complaints-list")) {
    loadComplaints();
  }
});

// Handle complaint form submission with file upload
async function handleComplaintSubmit(e) {
  e.preventDefault();

  // Check if user is authenticated
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to submit a complaint");
    window.location.href = "login.html";
    return;
  }

  const formData = new FormData();

  // Get form elements
  const title = document.querySelector(
    'input[placeholder="Enter issue title"]',
  );
  const category = document.querySelector("select");
  const description = document.querySelector("textarea");
  const imageInput = document.querySelector('input[type="file"]');

  // Validate required fields
  if (!title.value.trim() || !description.value.trim() || !category.value) {
    alert("Please fill in all required fields");
    return;
  }

  // Prepare form data
  formData.append("description", `${title.value}: ${description.value}`);
  formData.append("category", category.value);
  formData.append("location", "Community Area"); // Default location, can be enhanced later

  // Add image if selected
  if (imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  try {
    const response = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      alert("Complaint submitted successfully!");
      // Reset form
      complaintForm.reset();
      // Redirect to dashboard
      window.location.href = "index.html";
    } else {
      alert(data.message || "Failed to submit complaint");
    }
  } catch (error) {
    console.error("Complaint submission error:", error);
    alert("Network error. Please try again.");
  }
}

// Load and display complaints
async function loadComplaints() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/complaints`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      displayComplaints(data.data);
    } else {
      console.error("Failed to load complaints:", data.message);
    }
  } catch (error) {
    console.error("Error loading complaints:", error);
  }
}

// Display complaints in the UI
function displayComplaints(complaints) {
  const complaintsList = document.querySelector(".complaints-list");
  if (!complaintsList) return;

  if (!complaints || complaints.length === 0) {
    complaintsList.innerHTML =
      '<p class="text-slate-500">No complaints found.</p>';
    return;
  }

  complaintsList.innerHTML = complaints
    .map(
      (complaint) => `
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold text-lg">${complaint.category}</h3>
        <span class="px-2 py-1 text-xs rounded-full ${
          complaint.status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : complaint.status === "in-progress"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
        }">
          ${complaint.status}
        </span>
      </div>
      <p class="text-slate-600 mb-2">${complaint.description}</p>
      <div class="text-sm text-slate-500">
        <p>Location: ${complaint.location}</p>
        <p>Submitted: ${new Date(complaint.createdAt).toLocaleDateString()}</p>
      </div>
      ${
        complaint.images && complaint.images.length > 0
          ? `
        <div class="mt-3">
          <img src="${API_BASE}${complaint.images[0]}" alt="Issue image" class="max-w-full h-32 object-cover rounded">
        </div>
      `
          : ""
      }
    </div>
  `,
    )
    .join("");
}
