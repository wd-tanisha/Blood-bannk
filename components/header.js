// components/header.js

// This function dynamically injects a common header into any page
export function loadHeader() {
  // Create a <header> element
  const header = document.createElement('header');

  // Set its inner HTML
  header.innerHTML = `
    <nav style="background:rgb(221, 212, 212); padding: 1rem; color: white; text-align: center;">
      <h2>🩸 Blood Bank Management System</h2>
    </nav>
  `;

  // Append the header into the existing div with id="header-container"
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.appendChild(header);
  } else {
    console.error("Missing <div id='header-container'> in HTML");
  }
}
