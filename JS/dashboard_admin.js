const userAPI = "http://localhost:5000/users";
const hospitalAPI = "http://localhost:5000/hospitals";
const donorAPI = "http://localhost:5000/donors";
const stockAPI = "http://localhost:5000/hospital_stock";

// Show inline alerts
window.showInlineAlert = function (message, color = "#4caf50") {
  const alertBox = document.getElementById("inline-alert");
  alertBox.textContent = message;
  alertBox.style.backgroundColor = color;
  alertBox.style.color = "#fff";
  alertBox.style.padding = "10px";
  alertBox.style.margin = "10px 0";
  setTimeout(() => {
    alertBox.textContent = "";
    alertBox.style.padding = "0";
  }, 3000);
};

// Load 3 recent donors
window.loadLatestDonors = async function () {
  try {
    const res = await fetch(donorAPI);
    const donors = await res.json();
    const latest = donors.slice(-3).reverse();
    renderDonors(latest);
  } catch (err) {
    console.error("Error loading donors", err);
    window.showInlineAlert("Unable to load recent donors.", "#f44336");
  }
};

// Search donors by city + blood group
window.searchDonorsByCity = async function (city, bloodGroup) {
  try {
    const res = await fetch(donorAPI);
    const donors = await res.json();
    const filtered = donors.filter(d =>
      d.city.toLowerCase().includes(city.toLowerCase()) &&
      (bloodGroup === "" || d.bloodGroup.toLowerCase() === bloodGroup.toLowerCase())
    );

    const list = document.getElementById("donorList");
    if (filtered.length === 0) {
      list.innerHTML = "<p>No donors found.</p>";
      window.showInlineAlert("No donors found.", "#f44336");
    } else {
      renderDonors(filtered);
      window.showInlineAlert(`Found ${filtered.length} donor(s).`);
    }
  } catch (err) {
    console.error("Error filtering donors", err);
    window.showInlineAlert("Search failed.", "#f44336");
  }
};

// Render donor cards
function renderDonors(donors) {
  const donorList = document.getElementById("donorList");
  donorList.innerHTML = "";

  donors.forEach(d => {
    const card = document.createElement("div");
    card.className = "donor-card";
    card.innerHTML = `
      <strong>Name:</strong> ${d.name}<br>
      <strong>Blood Group:</strong> ${d.bloodGroup}<br>
      <strong>Mobile:</strong> ${d.mobile}<br>
      <strong>City:</strong> ${d.city}<br><br>
      <button onclick="window.editDonor('${d.id}')">Edit</button>
      <button onclick="window.deleteDonor('${d.id}')">Delete</button>
    `;
    donorList.appendChild(card);
  });
}

// Edit donor
window.editDonor = async function (id) {
  try {
    const res = await fetch(`${donorAPI}/${id}`);
    const donor = await res.json();

    const newName = prompt("Enter new name:", donor.name);
    const newCity = prompt("Enter new city:", donor.city);
    const newMobile = prompt("Enter new mobile:", donor.mobile);
    const newBloodGroup = prompt("Enter new blood group:", donor.bloodGroup);

    if (!newName || !newCity || !newMobile || !newBloodGroup) {
      return window.showInlineAlert("Edit cancelled or invalid input.", "#f44336");
    }

    const updateRes = await fetch(`${donorAPI}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...donor, name: newName, city: newCity, mobile: newMobile, bloodGroup: newBloodGroup })
    });

    if (updateRes.ok) {
      window.showInlineAlert("Donor updated successfully.", "green");
      window.loadLatestDonors();
    } else {
      throw new Error("Update failed");
    }
  } catch (err) {
    console.error("Edit donor error:", err);
    window.showInlineAlert("Failed to update donor.", "#f44336");
  }
};

// Delete donor
window.deleteDonor = async function (id) {
  if (!confirm("Are you sure you want to delete this donor?")) return;
  try {
    const res = await fetch(`${donorAPI}/${id}`, { method: "DELETE" });
    if (res.ok) {
      window.showInlineAlert("Donor deleted successfully.", "green");
      window.loadLatestDonors();
    } else {
      throw new Error("Delete failed");
    }
  } catch (err) {
    console.error("Delete donor error:", err);
    window.showInlineAlert("Failed to delete donor.", "#f44336");
  }
};

// Load users + hospitals
window.loadLatestUsers = async function () {
  try {
    const [userRes, hospitalRes] = await Promise.all([fetch(userAPI), fetch(hospitalAPI)]);
    const users = await userRes.json();
    const hospitals = await hospitalRes.json();

    const all = [...users, ...hospitals.map(h => ({ ...h, role: "hospital" }))];

    const sorted = all
      .map(u => ({
        ...u,
        registeredAt: u.registeredAt || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    renderUsersAsCards(sorted.slice(0, 3));
  } catch (err) {
    console.error("Error loading users", err);
    window.showInlineAlert("Unable to load users.", "#f44336");
  }
};

// Search users
window.searchUsers = async function (keyword, role) {
  try {
    const [userRes, hospitalRes] = await Promise.all([fetch(userAPI), fetch(hospitalAPI)]);
    const users = await userRes.json();
    const hospitals = await hospitalRes.json();

    const all = [...users, ...hospitals.map(h => ({ ...h, role: "hospital" }))];

    const filtered = all.filter(u =>
      (u.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        u.email?.toLowerCase().includes(keyword.toLowerCase())) &&
      (role === "" || u.role?.toLowerCase() === role.toLowerCase())
    );

    renderUsersAsCards(filtered);
    window.showInlineAlert(`${filtered.length} user(s) found.`);
  } catch (err) {
    console.error("Search user error:", err);
    window.showInlineAlert("User search failed.", "#f44336");
  }
};

// Render user cards
function renderUsersAsCards(users) {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  if (users.length === 0) {
    userList.innerHTML = "<p>No registered users found.</p>";
    return;
  }

  users.forEach(u => {
    const card = document.createElement("div");
    card.className = "donor-card";
    card.innerHTML = `
      <strong>Name:</strong> ${u.name}<br>
      <strong>Email:</strong> ${u.email}<br>
      <strong>Role:</strong> ${u.role}<br><br>
      <button onclick="window.editUser('${u.id}', '${u.role}')">Edit</button>
      <button onclick="window.deleteUser('${u.id}', '${u.role}')">Delete</button>
    `;
    userList.appendChild(card);
  });
}

// Edit user/hospital
window.editUser = async function (id, role) {
  const api = role === "hospital" ? hospitalAPI : userAPI;
  try {
    const res = await fetch(`${api}/${id}`);
    const user = await res.json();

    const newName = prompt("Enter new name:", user.name);
    const newEmail = prompt("Enter new email:", user.email);

    if (!newName || !newEmail) {
      return window.showInlineAlert("Edit cancelled or invalid input.", "#f44336");
    }

    const updateRes = await fetch(`${api}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, name: newName, email: newEmail })
    });

    if (updateRes.ok) {
      window.showInlineAlert(`${role} updated successfully.`, "green");
      window.loadLatestUsers();
    } else {
      throw new Error("Update failed");
    }
  } catch (err) {
    console.error("Edit error:", err);
    window.showInlineAlert("Failed to update.", "#f44336");
  }
};

// Delete user/hospital
window.deleteUser = async function (id, role) {
  if (!confirm("Are you sure you want to delete this user/hospital?")) return;

  const api = role === "hospital" ? hospitalAPI : userAPI;
  try {
    const res = await fetch(`${api}/${id}`, { method: "DELETE" });
    if (res.ok) {
      window.showInlineAlert(`${role} deleted successfully.`, "green");
      window.loadLatestUsers();
    } else {
      throw new Error("Delete failed");
    }
  } catch (err) {
    console.error("Delete error:", err);
    window.showInlineAlert("Failed to delete.", "#f44336");
  }
};

// Load hospital stock
window.loadHospitalStock = async function () {
  try {
    const [stockRes, hospitalRes] = await Promise.all([
      fetch(stockAPI),
      fetch(hospitalAPI)
    ]);

    const stock = await stockRes.json();
    const hospitals = await hospitalRes.json();

    const stockList = document.getElementById("stockList");
    stockList.innerHTML = "";

    hospitals.forEach(hospital => {
      const hospId = hospital.id?.toString();
      const items = stock.filter(s => s.hospitalId?.toString() === hospId);

      const card = document.createElement("div");
      card.className = "donor-card";
      card.innerHTML = `<h3>${hospital.name}</h3>`;

      if (items.length === 0) {
        card.innerHTML += `<p>No stock available.</p>`;
      } else {
        items.forEach(s => {
          const line = document.createElement("div");
          line.innerHTML = `
            <strong>${s.bloodGroup}:</strong> ${s.units} unit(s)
            <button onclick="window.updateStock('${s.id}', '${s.bloodGroup}', ${s.units}, '${s.hospitalId}')">Edit</button>
          `;
          card.appendChild(line);
        });
      }

      stockList.appendChild(card);
    });

  } catch (err) {
    console.error("Error loading stock:", err);
    window.showInlineAlert("Unable to load stock data.", "#f44336");
  }
};

// Update stock
window.updateStock = async function (id, bloodGroup, currentUnits, hospitalId) {
  const newUnits = prompt(`Enter new units for ${bloodGroup}:`, currentUnits);

  if (newUnits === null || isNaN(newUnits) || parseInt(newUnits) < 0) {
    return window.showInlineAlert("Invalid input. Update cancelled.", "#f44336");
  }

  try {
    const res = await fetch(`${stockAPI}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hospitalId,
        bloodGroup,
        units: parseInt(newUnits)
      })
    });

    if (res.ok) {
      window.showInlineAlert("Stock updated successfully.", "green");
      window.loadHospitalStock();
    } else {
      throw new Error("Update failed");
    }
  } catch (err) {
    console.error("Stock update error:", err);
    window.showInlineAlert("Failed to update stock.", "#f44336");
  }
};

// Auto-search triggers
function autoSearchDonors() {
  const city = document.getElementById("searchCity").value.trim();
  const bloodGroup = document.getElementById("bloodGroupFilter").value;
  if (city === "" && bloodGroup === "") {
    window.loadLatestDonors();
  } else {
    window.searchDonorsByCity(city, bloodGroup);
  }
}

function autoSearchUsers() {
  const keyword = document.getElementById("searchUser").value.trim();
  const role = document.getElementById("userRoleFilter").value;
  if (keyword === "" && role === "") {
    window.loadLatestUsers();
  } else {
    window.searchUsers(keyword, role);
  }
}

// On DOM Load
document.addEventListener("DOMContentLoaded", () => {
  window.loadLatestDonors();
  window.loadLatestUsers();
  window.loadHospitalStock();

  document.getElementById("searchCity").addEventListener("input", () => {
    clearTimeout(window.donorSearchDebounce);
    window.donorSearchDebounce = setTimeout(autoSearchDonors, 300);
  });

  document.getElementById("bloodGroupFilter").addEventListener("change", autoSearchDonors);
  document.getElementById("searchUser").addEventListener("input", () => {
    clearTimeout(window.userSearchDebounce);
    window.userSearchDebounce = setTimeout(autoSearchUsers, 300);
  });

  document.getElementById("userRoleFilter").addEventListener("change", autoSearchUsers);
});

// Logout
window.logout = function () {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
};
