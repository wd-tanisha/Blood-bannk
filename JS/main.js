// js/main.js

// Import dynamic header and footer components
import { loadHeader } from '../components/header.js';
import { loadFooter } from '../components/footer.js';

// Call them to inject into the DOM
loadHeader();
loadFooter();

// Handles role selection and redirects to login page with query param
window.handleRoleSelect = function(role) {
  // Save selected role in sessionStorage (optional)
  sessionStorage.setItem('selectedRole', role);

  // Redirect to login.html with role as query string
  window.location.href = `login.html?role=${role}`;
};
