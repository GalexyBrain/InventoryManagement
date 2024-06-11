// Sample data for customers with unique IDs
let customers = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210" }
];

// Function to display customers
function displayCustomers(filteredCustomers = customers) {
    const customerList = document.querySelector('.customer-list');
    customerList.innerHTML = '';

    filteredCustomers.forEach((customer, index) => {
        const customerElement = document.createElement('div');
        customerElement.classList.add('customer-item');

        const customerInfo = document.createElement('div');
        customerInfo.classList.add('customer-info');

        const customerId = document.createElement('p');
        customerId.textContent = `ID: ${customer.id}`;

        const customerName = document.createElement('h3');
        customerName.textContent = customer.name;

        const customerEmail = document.createElement('p');
        customerEmail.textContent = `Email: ${customer.email}`;

        const customerPhone = document.createElement('p');
        customerPhone.textContent = `Phone: ${customer.phone}`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editCustomer(index);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteCustomer(index);

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

// Function to toggle visibility of add customer form
function toggleAddCustomerForm() {
    const addCustomerForm = document.querySelector('.add-customer-form');
    addCustomerForm.style.display = addCustomerForm.style.display === 'none' ? 'block' : 'none';
}

// Function to add a new customer
function addCustomer() {
    const customerID = document.querySelector('input[name="customerID"]').value;
    const customerName = document.querySelector('input[name="customerName"]').value;
    const customerEmail = document.querySelector('input[name="customerEmail"]').value;
    const customerPhone = document.querySelector('input[name="customerPhone"]').value;

    const newCustomer = {
        id: customerID,
        name: customerName,
        email: customerEmail,
        phone: customerPhone
    };

    customers.push(newCustomer);
    displayCustomers();

    // Reset the form fields
    document.querySelector('input[name="customerID"]').value = customers.length ? customers[customers.length - 1].id + 1 : 1;
    document.querySelector('input[name="customerName"]').value = '';
    document.querySelector('input[name="customerEmail"]').value = '';
    document.querySelector('input[name="customerPhone"]').value = '';

    // Hide the form after adding the customer
    toggleAddCustomerForm();
}

// Function to edit a customer
function editCustomer(index) {
    const customer = customers[index];
    
    const newCustomerId = parseInt(prompt("Enter new ID:", customer.id));
    const newCustomerName = prompt("Enter new name:", customer.name);
    const newCustomerEmail = prompt("Enter new email:", customer.email);
    const newCustomerPhone = prompt("Enter new phone:", customer.phone);

    if (!isNaN(newCustomerId) && newCustomerId !== null) customer.id = newCustomerId;
    if (newCustomerName !== null) customer.name = newCustomerName;
    if (newCustomerEmail !== null) customer.email = newCustomerEmail;
    if (newCustomerPhone !== null) customer.phone = newCustomerPhone;

    displayCustomers();
}

// Function to delete a customer
function deleteCustomer(index) {
    if (confirm("Are you sure you want to delete this customer?")) {
        customers.splice(index, 1);
        displayCustomers();
    }
}

// Implement search functionality
document.getElementById('search').addEventListener('input', function() {
    const searchText = this.value.toLowerCase();
    const filteredCustomers = customers.filter(customer => {
        return customer.name.toLowerCase().includes(searchText) || 
            customer.email.toLowerCase().includes(searchText) || 
            customer.phone.toLowerCase().includes(searchText);
    });
    displayCustomers(filteredCustomers);
});

// Initial display of customers
displayCustomers();
