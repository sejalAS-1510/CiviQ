(async () => {
  try {
    const API_BASE = "http://localhost:5000/api";
    const endpoint = "/users/login";
    const response = await fetch(API_BASE + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    console.log("status", response.status);
    const body = await response.text();
    console.log("body", body);

    try {
      const data = JSON.parse(body);
      if (!response.ok) {
        throw new Error(
          data.message ||
            "HTTP " + response.status + ": " + response.statusText,
        );
      }
      console.log("success", data);
    } catch (parseErr) {
      console.error("json parse error", parseErr.message);
    }
  } catch (err) {
    console.error("request error", err);
  }
})();
