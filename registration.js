document.addEventListener("DOMContentLoaded", function() {
    const registrationForm = document.getElementById("registrationForm");

    registrationForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            document.getElementById("confirmPasswordError").textContent = "Passwords do not match";
            return;
        }

        fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, email: email, password: password })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === "Registration successful!") {
                // Redirect to login page or perform other actions
            }
        })
        .catch(error => console.error('Error:', error));
    });
});
