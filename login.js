document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Login successful!") {
                fetchMetrics();
            } else {
                alert("Invalid username or password");
            }
        })
        .catch(error => console.error('Error:', error));
    });

    function fetchMetrics() {
        fetch('http://127.0.0.1:5000/dashboard-metrics', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector('.metric.products p').textContent = data.products;
            document.querySelector('.metric.orders p').textContent = data.orders;
            document.querySelector('.metric.customers p').textContent = data.customers;
            document.querySelector('.metric.revenue p').textContent = `Rs ${data.revenue}`;
        })
        .catch(error => console.error('Error:', error));
    }
});
