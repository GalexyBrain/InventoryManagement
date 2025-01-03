document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Configure it: POST-request for the URL http://13.201.225.19:80/login
    xhr.open('POST', 'http://13.201.225.19:80/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // Setup our listener to process completed requests
    xhr.onload = function () {
        // Process our return data
        if (xhr.status >= 200 && xhr.status < 300) {
            // Success!
            var responseData = JSON.parse(xhr.responseText);
            if (responseData.message === 'Login successful!') {
                // Redirect to dashboard on successful login
                window.location.href = "dashboard.html";
            } else {
                // Handle unexpected success response
                alert('Unexpected response: ' + responseData.message);
            }
        } else if (xhr.status === 401) {
            // Handle login failure due to incorrect username or password
            alert('Invalid username or password. Please try again.');
        } else {
            // Handle request error
            alert('Request failed. Please try again later.');
        }
    };

    // Handle network errors
    xhr.onerror = function () {
        alert('Network error. Please try again later.');
    };

    // Send the request
    xhr.send(JSON.stringify({ username: username, password: password }));
});
