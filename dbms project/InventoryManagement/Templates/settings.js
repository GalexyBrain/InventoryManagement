document.getElementById('settingsForm').addEventListener('submit', async function (e) {
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

    try {
        const response = await fetch('http://127.0.0.1:5000/update_settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update settings.');
        }

        alert('Settings updated successfully.');
        document.getElementById('settingsForm').reset();
        window.location.href = 'login.html'; // Redirect to the login page
    } catch (error) {
        console.error('Error updating settings:', error);
        alert('Error updating settings. Please try again.');
    }
});

document.getElementById('logout').addEventListener('click', function(event) {
    event.preventDefault();

    fetch('http://127.0.0.1:5000/logout')
    .then(response => {
        if (response.ok) {
            alert('Logout successful.');
            window.location.href = 'login.html';  // Redirect to login page
        } else {
            alert('Logout failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
        alert('Error during logout. Please try again.');
    });
});
