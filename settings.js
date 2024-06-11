document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match.');
        return;
    }
    
    // Add your logic to update the user information and password here
    
    alert('Settings updated successfully.');
    document.getElementById('settingsForm').reset();
    window.location.href = 'login.html'; // Redirect to the login page
});
