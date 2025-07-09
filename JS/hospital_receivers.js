(() => {
  const hospitalUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!hospitalUser || hospitalUser.role !== "hospital") {
    alert("Access denied. Hospitals only.");
    window.location.href = "login.html";
  }

  const receiverAPI = "http://localhost:5000/hospital_receivers";

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("hospitalName").textContent = hospitalUser.name;
    document.getElementById("receiverForm").addEventListener("submit", window.addOrUpdateReceiver);
    window.loadReceivers();
  });

  window.loadReceivers = async function () {
    try {
      const res = await fetch(`${receiverAPI}?hospitalId=${hospitalUser.id}`);
      const receivers = await res.json();
      renderReceivers(receivers);
    } catch (err) {
      console.error("Failed to load receivers", err);
      window.showInlineAlert("Could not load receivers.", "red");
    }
  };

  window.addOrUpdateReceiver = async function (e) {
    e.preventDefault();

    const id = document.getElementById("receiverId").value;
    const name = document.getElementById("receiverName").value.trim();
    const bloodGroup = document.getElementById("receiverBloodGroup").value.trim().toUpperCase();
    const mobile = document.getElementById("receiverMobile").value.trim();
    const city = document.getElementById("receiverCity").value.trim();

    if (!name || !bloodGroup || !mobile || !city) {
      return window.showInlineAlert("Please fill all fields.", "#f44336");
    }

    // Confirmation popup before add/update
    const action = id ? "update" : "add";
    if (!confirm(`Are you sure you want to ${action} this receiver?`)) return;

    const resCheck = await fetch(`${receiverAPI}?mobile=${mobile}&hospitalId=${hospitalUser.id}`);
    const existing = await resCheck.json();

    if (!id && existing.length > 0) {
      return window.showInlineAlert("This mobile number is already registered.", "#f44336");
    }

    const receiverData = {
      name,
      bloodGroup,
      mobile,
      city,
      hospitalId: hospitalUser.id
    };

    try {
      let response;
      if (id) {
        response = await fetch(`${receiverAPI}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(receiverData)
        });
        if (response.ok) {
          e.target.reset();
          window.loadReceivers();
          alert("Receiver updated successfully.");
        } else {
          throw new Error("Server error");
        }
      } else {
        response = await fetch(receiverAPI, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(receiverData)
        });
        if (response.ok) {
          e.target.reset();
          window.loadReceivers();
          alert("Receiver added successfully.");
        } else {
          throw new Error("Server error");
        }
      }
    } catch (err) {
      console.error("Error in addOrUpdateReceiver", err);
      window.showInlineAlert("Failed to save receiver.", "#f44336");
    }
  };

  function renderReceivers(receivers) {
    const tbody = document.getElementById("receiverTable");
    tbody.innerHTML = "";

    receivers.forEach(receiver => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${receiver.name}</td>
        <td>${receiver.bloodGroup}</td>
        <td>${receiver.mobile}</td>
        <td>${receiver.city}</td>
        <td>
          <button onclick='window.editReceiver(${JSON.stringify(receiver)})'>Edit</button>
          <button onclick='window.deleteReceiver("${receiver.id}")'>Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.editReceiver = function (receiver) {
    document.getElementById("receiverId").value = receiver.id;
    document.getElementById("receiverName").value = receiver.name;
    document.getElementById("receiverBloodGroup").value = receiver.bloodGroup;
    document.getElementById("receiverMobile").value = receiver.mobile;
    document.getElementById("receiverCity").value = receiver.city;
  };

  window.deleteReceiver = async function (id) {
    if (!confirm("Are you sure you want to delete this receiver?")) return;

    try {
      const res = await fetch(`${receiverAPI}/${id}`, { method: "DELETE" });

      if (res.ok) {
        alert("Receiver deleted successfully.");
        window.loadReceivers();
      } else {
        window.showInlineAlert("Failed to delete receiver.", "#f44336");
      }
    } catch (err) {
      console.error("Error deleting receiver", err);
      window.showInlineAlert("Error occurred while deleting receiver.", "#f44336");
    }
  };

  window.filterReceivers = function () {
    const query = document.getElementById("searchReceiver").value.trim().toLowerCase();
    const rows = document.querySelectorAll("#receiverTable tr");
    rows.forEach(row => {
      const nameCell = row.querySelector("td");
      if (nameCell) {
        const name = nameCell.textContent.trim().toLowerCase();
        row.style.display = name.includes(query) ? "" : "none";
      }
    });
  };
})();
