const hospitalUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!hospitalUser || hospitalUser.role !== "hospital") {
  alert("Access denied. Hospitals only.");
  window.location.href = "login.html";
}

const donorAPI = "http://localhost:5000/hospital_donors";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hospitalName").textContent = hospitalUser.name;
  document.getElementById("donorForm").addEventListener("submit", handleDonorSubmit);
  loadDonors();
});

// Show message with close button and timeout
function showMessage(msg, color = "green", duration = 15000) {
  const statusBox = document.getElementById("statusMessage");
  const statusText = document.getElementById("statusText");

  statusText.textContent = msg;
  statusBox.style.color = color;
  statusBox.style.backgroundColor = color === "green" ? "#e6ffe6" : "#ffe6e6";
  statusBox.style.borderColor = color === "green" ? "#66cc66" : "#ff6666";
  statusBox.style.display = "block";

  // Clear previous timeout if exists
  if (window.statusTimeout) clearTimeout(window.statusTimeout);

  // Hide message after duration
  window.statusTimeout = setTimeout(() => {
    closeStatus();
  }, duration);
}

// Close status manually
function closeStatus() {
  const statusBox = document.getElementById("statusMessage");
  const statusText = document.getElementById("statusText");

  statusText.textContent = "";
  statusBox.style.display = "none";
}

async function loadDonors() {
  try {
    const res = await fetch(`${donorAPI}?hospitalId=${hospitalUser.id}`);
    const donors = await res.json();
    renderDonors(donors);
  } catch (err) {
    console.error("Failed to load donors", err);
    showMessage("Failed to load donors.", "red");
  }
}

async function handleDonorSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("donorId").value;
  const name = document.getElementById("donorName").value.trim();
  const bloodGroup = document.getElementById("donorBloodGroup").value.trim().toUpperCase();
  const mobile = document.getElementById("donorMobile").value.trim();
  const city = document.getElementById("donorCity").value.trim();

  if (!name || !bloodGroup || !mobile || !city) {
    return window.showInlineAlert("Please fill all fields.", "#f44336");
  }

  // Confirmation popup before add/update
  const action = id ? "update" : "add";
  if (!confirm(`Are you sure you want to ${action} this donor?`)) return;

  const donorData = {
    name,
    bloodGroup,
    mobile,
    city,
    hospitalId: String(hospitalUser.id)
  };

  try {
    let res;
    if (id) {
      res = await fetch(`${donorAPI}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorData)
      });

      if (res.ok) {
        window.showInlineAlert("Donor updated successfully.", "#4caf50");
      } else {
        window.showInlineAlert("Failed to update donor.", "#f44336");
      }
    } else {
      res = await fetch(donorAPI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorData)
      });

      if (res.ok) {
        window.showInlineAlert("Donor added successfully.", "#4caf50");
      } else {
        window.showInlineAlert("Failed to add donor.", "#f44336");
      }
    }

    e.target.reset();
    loadDonors();
  } catch (err) {
    console.error("Error saving donor", err);
    window.showInlineAlert("An error occurred while saving donor.", "#f44336");
  }
}

function renderDonors(donors) {
  const tbody = document.getElementById("donorTable");
  tbody.innerHTML = "";

  donors.forEach(donor => {
    const encodedDonor = encodeURIComponent(JSON.stringify(donor));
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${donor.name}</td>
      <td>${donor.bloodGroup}</td>
      <td>${donor.mobile}</td>
      <td>${donor.city}</td>
      <td>
        <button onclick='editDonor("${encodedDonor}")'>Edit</button>
        <button onclick='deleteDonor("${donor.id}")'>Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editDonor(encodedDonor) {
  const donor = JSON.parse(decodeURIComponent(encodedDonor));
  document.getElementById("donorId").value = donor.id;
  document.getElementById("donorName").value = donor.name;
  document.getElementById("donorBloodGroup").value = donor.bloodGroup;
  document.getElementById("donorMobile").value = donor.mobile;
  document.getElementById("donorCity").value = donor.city;
}

async function deleteDonor(id) {
  if (!confirm("Are you sure you want to delete this donor?")) return;

  try {
    const res = await fetch(`${donorAPI}/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      showMessage("Donor deleted successfully.");
      loadDonors();
    } else {
      showMessage("Failed to delete donor. Please try again.", "red");
    }
  } catch (err) {
    console.error("Error deleting donor", err);
    showMessage("An error occurred while deleting the donor.", "red");
  }
}
