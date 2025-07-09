// js/dashboard_user.js
// User Dashboard: Search for donors by city

const user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user || user.role !== "user") {
  alert("Access denied. Users only.");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("userName").textContent = user.name;
});

// Function to search donors by city
async function searchDonors() {
  const city = document.getElementById("searchCity").value.trim();
  if (!city) {
    alert("Please enter a city to search.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/donors");
    const donors = await res.json();

    const filtered = donors.filter(d => d.city.toLowerCase() === city.toLowerCase());
    const resultContainer = document.getElementById("donorResults");
    resultContainer.innerHTML = "";

    if (filtered.length === 0) {
      resultContainer.innerHTML = '<p>No donors found in this city.</p>';
      window.showInlineAlert("No donors found in this city.", "#f44336");
      return;
    }

    // Render as cards
    filtered.forEach(d => {
      const card = document.createElement("div");
      card.className = "donor-card";
      card.innerHTML = `
        <strong>Name:</strong> ${d.name}<br>
        <strong>Blood Group:</strong> ${d.bloodGroup}<br>
        <strong>Mobile:</strong> ${d.mobile}<br>
        <strong>City:</strong> ${d.city}
      `;
      resultContainer.appendChild(card);
    });
    window.showInlineAlert(`Found ${filtered.length} donor(s) in ${city}.`, "#4caf50");
  } catch (error) {
    console.error("Error fetching donors:", error);
    window.showInlineAlert("Server error while searching.", "#f44336");
  }
}


// Logout
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

window.searchDonors = searchDonors;
window.logout = logout;
