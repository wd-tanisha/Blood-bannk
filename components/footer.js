export function loadFooter() {
  const footer = document.createElement("footer");
  footer.innerHTML = `
    <div style="background: #222; color: #fff; text-align: center; padding: 1rem;">
      &copy; 2025 Blood Bank System. All rights reserved.
    </div>
  `;
  document.getElementById("footer-container").appendChild(footer);
}
