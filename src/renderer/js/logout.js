function logout() {
  // Clear the stored login user data
  localStorage.removeItem("loginUser");
  
  // Redirect back to login page
  window.location.href = "index.html";
}

module.exports = { logout };
