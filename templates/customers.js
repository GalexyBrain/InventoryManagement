let customers = [];

// Function to display customers
function displayCustomers(filteredCustomers = []) {
    const customerList = document.querySelector('.customer-list');
    customerList.innerHTML = '';

    filteredCustomers.forEach((customer, index) => {
        const customerElement = document.createElement('div');
        customerElement.classList.add('customer-item');

        const customerInfo = document.createElement('div');
        customerInfo.classList.add('customer-info');

        const customerId = document.createElement('p');
        customerId.textContent = `ID: ${customer.Id}`;

        const customerName = document.createElement('h3');
        customerName.textContent = customer.Name;

        const customerEmail = document.createElement('p');
        customerEmail.textContent = `Email: ${customer.Email}`;

        const customerPhone = document.createElement('p');
        customerPhone.textContent = `Phone: ${customer.Phone}`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editCustomer(customer.Id);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteCustomer(customer.Id);

        customerInfo.appendChild(customerId);
        customerInfo.appendChild(customerName);
        customerInfo.appendChild(customerEmail);
        customerInfo.appendChild(customerPhone);
        customerInfo.appendChild(editButton);
        customerInfo.appendChild(deleteButton);

        customerElement.appendChild(customerInfo);
        customerList.appendChild(customerElement);
    });
}

// Function to fetch customers from API
async function fetchCustomers() {
    try {
        const response = await fetch('http://13.201.225.19/api/customers');
        const data = await response.json();
        customers = data.customers;  // Assign fetched customers to the global variable
        displayCustomers(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

// Function to add a new customer
async function addCustomer() {
    const customerID = document.querySelector('input[name="customerID"]').value;
    const customerName = document.querySelector('input[name="customerName"]').value;
    const customerEmail = document.querySelector('input[name="customerEmail"]').value;
    const customerPhone = document.querySelector('input[name="customerPhone"]').value;

    try {
        const response = await fetch('http://13.201.225.19/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                Id: customerID,
                Name: customerName,
                Email: customerEmail,
                Phone: customerPhone
            })
        });

        if (response.ok) {
            fetchCustomers();
            // Reset the form fields
            document.querySelector('input[name="customerID"]').value = '';
            document.querySelector('input[name="customerName"]').value = '';
            document.querySelector('input[name="customerEmail"]').value = '';
            document.querySelector('input[name="customerPhone"]').value = '';
        } else if (response.status === 400) {
            const data = await response.json();
            alert(data.message);  // Display alert with error message
            console.error('Failed to add customer:', data.message);
        } else {
            alert('Failed to add customer');
            console.error('Failed to add customer:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding customer:', error);
    }
}

// Function to edit a customer
async function editCustomer(customerId) {
    const customer = customers.find(cust => cust.Id === customerId);

    const newCustomerName = prompt("Enter new name:", customer.Name);
    const newCustomerEmail = prompt("Enter new email:", customer.Email);
    const newCustomerPhone = prompt("Enter new phone:", customer.Phone);

    try {
        const response = await fetch(`http://13.201.225.19/api/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                Id: customerId,
                Name: newCustomerName,
                Email: newCustomerEmail,
                Phone: newCustomerPhone
            })
        });

        if (response.ok) {
            fetchCustomers();
        } else if (response.status === 400) {
            alert('Customer does not exist.');
            console.error('Failed to edit customer:', response.statusText);
        } else {
            console.error('Failed to edit customer:', response.statusText);
        }
    } catch (error) {
        console.error('Error editing customer:', error);
    }
}

// Function to delete a customer
async function deleteCustomer(customerId) {
    if (confirm("Are you sure you want to delete this customer?")) {
        try {
            const response = await fetch(`http://13.201.225.19/api/customers/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });

            if (response.ok) {
                fetchCustomers();
            } else if (response.status === 400) {
                alert('Customer does not exist.');
                console.error('Failed to delete customer:', response.statusText);
            } else {
                console.error('Failed to delete customer:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    }
}

// Implement search functionality
document.getElementById('search').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const filteredCustomers = customers.filter(customer => {
        return customer.Name.toLowerCase().includes(searchText) ||
            customer.Email.toLowerCase().includes(searchText) ||
            customer.Phone.toLowerCase().includes(searchText);
    });
    displayCustomers(filteredCustomers);
});

// Initial display of customers
fetchCustomers();
