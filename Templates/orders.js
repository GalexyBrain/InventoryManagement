let orders = [];

document.addEventListener('DOMContentLoaded', function () {
    fetchOrders();
    document.getElementById('search').addEventListener('input', searchOrders);
    document.getElementById('submit').addEventListener('click', addOrder);
    document.getElementById('add-item').addEventListener('click', addItem);
});

async function fetchOrders() {
    try {
        const response = await fetch('http://127.0.0.1:5000/orders');
        if (!response.ok) {
            throw new Error('Failed to fetch orders.');
        }
        const data = await response.json();
        orders = data.orders;
        displayOrders();
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

function displayOrders(filteredOrders = null) {
    const ordersList = document.querySelector('.orders-list');
    ordersList.innerHTML = '';

    const ordersToDisplay = filteredOrders || orders;

    ordersToDisplay.forEach(order => {
        const orderElement = createOrderElement(order);
        ordersList.appendChild(orderElement);
    });
}

function createOrderElement(order) {
    const orderElement = document.createElement('div');
    orderElement.classList.add('order');

    const orderId = document.createElement('h2');
    orderId.textContent = `Order ID: #${order.Id}`;

    const orderInfo = document.createElement('div');
    orderInfo.classList.add('order-info');

    const customerId = document.createElement('p');
    customerId.textContent = `Customer ID: ${order.CustomerId}`;

    const date = document.createElement('p');
    date.textContent = `Date: ${order.Date}`;

    const price = document.createElement('p');
    price.textContent = `Price: $${order.TotalPrice}`;

    const type = document.createElement('p');
    type.textContent = `Type: ${order.Type === 'p' ? 'Purchase' : 'Sale'}`;

    const generateBillButton = document.createElement('button');
    generateBillButton.textContent = 'Generate Bill';
    generateBillButton.addEventListener('click', () => generateBill(order));

    orderInfo.appendChild(customerId);
    orderInfo.appendChild(date);
    orderInfo.appendChild(price);
    orderInfo.appendChild(type);

    orderElement.appendChild(orderId);
    orderElement.appendChild(orderInfo);
    orderElement.appendChild(generateBillButton);   

    return orderElement;
}

function addItem(e) {
    e.preventDefault();
    const orderItemsContainer = document.getElementById('order-items');
    const newItem = document.createElement('div');
    newItem.classList.add('order-item');
    newItem.innerHTML = `
        <input type="number" name="productId" placeholder="Product ID" required>
        <input type="number" name="quantity" placeholder="Quantity" required>
    `;
    orderItemsContainer.appendChild(newItem);
}

async function addOrder(e) {
    e.preventDefault();

    const customerId = document.querySelector('input[name="customerId"]').value;
    const orderItems = document.querySelectorAll('.order-item');
    const type = document.querySelector('select[name="type"]').value;


    const items = [];
    orderItems.forEach(item => {
        const productId = item.querySelector('input[name="productId"]').value;
        const quantity = item.querySelector('input[name="quantity"]').value;
        items.push({ productId, quantity, type });
    });

    const newOrder = { customerId, type,  items };

    try {
        const response = await fetch('http://127.0.0.1:5000/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newOrder)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add order.');
        }

        alert('Order added successfully.');
        document.querySelector('input[name="customerId"]').value = '';
        resetOrderForm(); // Helper function to reset the order form fields
        fetchOrders(); // Fetch and display updated orders
    } catch (error) {
        console.error('Error adding order:', error);
        alert('Error adding order. Please try again.');
    }
}

// Function to reset order form fields
function resetOrderForm() {
    document.getElementById('order-items').innerHTML = `
        <div class="order-item">
            <input type="number" name="productId" placeholder="Product ID" required>
            <input type="number" name="quantity" placeholder="Quantity" required>
        </div>
    `;
}

async function generateBill(order) {
    try {
        // Construct the API endpoint for fetching transaction details
        const apiUrl = `http://127.0.0.1:5000/api/orders/${order.Id}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch transaction details for ID ${order.Id}`);
        }
        
        const transactionDetails = await response.json(); // Assuming the API returns JSON
        
        let billContent = `<p>Customer ID: ${transactionDetails.CustomerId}</p>`;
        let totalCost = 0;

        transactionDetails.Items.forEach((item, index) => {
            const price = parseFloat(item.Price); // Convert price to float if necessary
            totalCost += price * item.Quantity;

            billContent += `
                <p>Item ${index + 1}:</p>
                <p>Product Name: ${item.ProductName}</p>
                <p>Product ID: ${item.ItemId}</p>
                <p>Quantity: ${item.Quantity}</p>
                <p>Price: $${price.toFixed(2)}</p>
                <p>Cost: $${(price * item.Quantity).toFixed(2)}</p>
                <hr>
            `;
        });

        billContent += `<p>Total Cost: $${totalCost.toFixed(2)}</p>`;

        // Open a new window for displaying the bill
        const billWindow = window.open('', '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        if (!billWindow) {
            throw new Error('Popup window blocked! Please enable popups for this site.');
        }

        // Write HTML content to the new window
        billWindow.document.write(`
            <html>
            <head>
                <title>Bill for Order ID ${order.Id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    p { margin-bottom: 8px; }
                    hr { border: 0; border-top: 1px solid #ccc; margin: 10px 0; }
                </style>
            </head>
            <body>
                <h1>Bill for Order ID ${order.Id}</h1>
                ${billContent}
            </body>
            </html>
        `);

        // Close the document stream
        billWindow.document.close();

    } catch (error) {
        console.error('Error generating bill:', error);
        // Handle error display or logging
    }
}

function searchOrders() {
    const searchText = this.value.toLowerCase();
    const filteredOrders = orders.filter(order => {
        return order.CustomerId.toLowerCase().includes(searchText) ||
            order.Items.some(item => item.ProductId.toLowerCase().includes(searchText));
    });
    displayOrders(filteredOrders);
}
