// js/dashboard_hospital.js
const hospitalUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!hospitalUser || hospitalUser.role !== "hospital") {
  alert("Access denied. Hospitals only.");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hospitalName").textContent = hospitalUser.name;
  loadHospitalDashboard();
});

// -----------------------------
// Load blood stock, donors, receivers
// -----------------------------
async function loadHospitalDashboard() {
  try {
    const [donorRes, receiverRes, stockRes] = await Promise.all([
      fetch(`http://localhost:5000/hospital_donors?hospitalId=${hospitalUser.id}`),
      fetch(`http://localhost:5000/hospital_receivers?hospitalId=${hospitalUser.id}`),
      fetch(`http://localhost:5000/hospital_stock?hospitalId=${hospitalUser.id}`)
    ]);

    const donors = await donorRes.json();
    const receivers = await receiverRes.json();
    const stock = await stockRes.json();

    renderDonorChart(donors);
    renderReceiverChart(receivers);
    renderStockChart(stock);
  } catch (error) {
    console.error("Error loading hospital data:", error);
    alert("Failed to load hospital dashboard.");
  }
}

// -----------------------------
// Render: Donor Pie Chart
// -----------------------------
function renderDonorChart(donors) {
  const groupCount = {};
  donors.forEach(d => {
    groupCount[d.bloodGroup] = (groupCount[d.bloodGroup] || 0) + 1;
  });

  const labels = Object.keys(groupCount);
  const data = Object.values(groupCount);

  new Chart(document.getElementById("donorChart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: "Donors by Blood Group",
        data,
        backgroundColor: getColors(labels.length)
      }]
    }
  });
}

// -----------------------------
// Render: Receiver Pie Chart
// -----------------------------
function renderReceiverChart(receivers) {
  const groupCount = {};
  receivers.forEach(r => {
    groupCount[r.bloodGroup] = (groupCount[r.bloodGroup] || 0) + 1;
  });

  const labels = Object.keys(groupCount);
  const data = Object.values(groupCount);

  new Chart(document.getElementById("receiverChart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: "Receivers by Blood Group",
        data,
        backgroundColor: getColors(labels.length)
      }]
    }
  });
}

// -----------------------------
// ✅ FIXED: Render Stock Chart by aggregating stock
// -----------------------------
function renderStockChart(stockArray) {
  if (!stockArray.length) return;

  const groupCount = {};
  stockArray.forEach(s => {
    const group = s.bloodGroup;
    const units = s.units;
    groupCount[group] = (groupCount[group] || 0) + units;
  });

  const labels = Object.keys(groupCount);
  const data = Object.values(groupCount);

  new Chart(document.getElementById("bloodStockChart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: "Available Stock",
        data,
        backgroundColor: getColors(labels.length)
      }]
    }
  });
}

// -----------------------------
// Helper: Colors for charts
// -----------------------------
function getColors(count) {
  const colors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
    "#9966FF", "#FF9F40", "#66BB6A", "#D32F2F"
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

// -----------------------------
// Logout
// -----------------------------
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}
window.logout = logout;
