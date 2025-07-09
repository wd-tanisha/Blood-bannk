const hospitalUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!hospitalUser || hospitalUser.role !== "hospital") {
  alert("Access denied. Hospitals only.");
  window.location.href = "login.html";
}

const API_URL = `http://localhost:5000/hospital_stock`;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hospitalName").textContent = hospitalUser.name;
  document.getElementById("stockForm").addEventListener("submit", handleStockSubmit);
  loadStockData();
});

let chartRef = null;

// -----------------------------
// Load Stock Data (Table + Chart)
// -----------------------------
async function loadStockData() {
  try {
    const res = await fetch(`${API_URL}?hospitalId=${Number(hospitalUser.id)}`);
    const stock = await res.json();

    renderStockTable(stock);
    renderStockChart(stock);
  } catch (error) {
    console.error("Error loading stock data:", error);
    alert("Failed to load stock.");
  }
}

// -----------------------------
// Add / Update Stock Handler
// -----------------------------
async function handleStockSubmit(e) {
  e.preventDefault();
  const bloodGroup = document.getElementById("bloodGroup").value.trim().toUpperCase();
  const units = parseInt(document.getElementById("units").value);
  const hospitalId = Number(hospitalUser.id);

  if (!bloodGroup || isNaN(units)) {
    alert("Please enter valid values.");
    return;
  }

  try {
    // Fetch all stock and filter manually
    const res = await fetch(API_URL);
    const allStock = await res.json();
    const existing = allStock.find(
      s => Number(s.hospitalId) === hospitalId && s.bloodGroup === bloodGroup
    );

    if (existing) {
      // Update existing
      await fetch(`${API_URL}/${existing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ units })
      });
      alert(`${bloodGroup} stock updated successfully.`);
    } else {
      // Add new
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId,
          bloodGroup,
          units
        })
      });
      alert(`${bloodGroup} stock added successfully.`);
    }

    document.getElementById("stockForm").reset();
    document.getElementById("bloodGroup").disabled = false;

    const cancelBtn = document.getElementById("cancelEdit");
    if (cancelBtn) cancelBtn.remove();

    loadStockData();
  } catch (error) {
    console.error("Error saving stock:", error);
    alert("Failed to save stock.");
  }
}

// -----------------------------
// Render Table View
// -----------------------------
function renderStockTable(stock) {
  const tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML = "";

  stock.forEach(entry => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.bloodGroup}</td>
      <td>${entry.units}</td>
      <td>
        <button onclick="editStock('${entry.id}', '${entry.bloodGroup}', ${entry.units})">Edit</button>
        <button onclick="deleteStock('${entry.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// -----------------------------
// Render Doughnut Chart
// -----------------------------
function renderStockChart(stock) {
  const ctx = document.getElementById("stockChart").getContext("2d");
  const labels = stock.map(s => s.bloodGroup);
  const data = stock.map(s => s.units);

  if (chartRef) chartRef.destroy();
  chartRef = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: "Blood Stock",
        data,
        backgroundColor: getColors(data.length)
      }]
    }
  });
}

// -----------------------------
// Edit Function (Prefill form)
// -----------------------------
function editStock(id, group, units) {
  const bgSelect = document.getElementById("bloodGroup");
  bgSelect.value = group;
  bgSelect.disabled = true;

  document.getElementById("units").value = units;

  if (!document.getElementById("cancelEdit")) {
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.id = "cancelEdit";
    cancelBtn.type = "button";
    cancelBtn.style.marginLeft = "1rem";
    cancelBtn.onclick = () => {
      document.getElementById("stockForm").reset();
      bgSelect.disabled = false;
      cancelBtn.remove();
    };
    document.getElementById("stockForm").appendChild(cancelBtn);
  }
}

// -----------------------------
// Delete Function
// -----------------------------
async function deleteStock(id) {
  if (!confirm("Are you sure you want to delete this stock entry?")) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    alert("Stock entry deleted.");
    loadStockData();
  } catch (error) {
    console.error("Error deleting stock:", error);
    alert("Failed to delete.");
  }
}

// -----------------------------
// Chart Colors
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
