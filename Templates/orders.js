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

function displayOrders() {
    const ordersList = document.querySelector('.orders-list');
    ordersList.innerHTML = '';

    orders.forEach(order => {
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

    order.Items.forEach(item => {
        const productName = document.createElement('p');
        productName.textContent = `Product Name: ${item.ProductName}`;
        
        const productId = document.createElement('p');
        productId.textContent = `Product ID: ${item.ProductId}`;

        const quantity = document.createElement('p');
        quantity.textContent = `Quantity: ${item.Quantity}`;

        const type = document.createElement('p');
        type.textContent = `Type: ${item.Type === 'p' ? 'Purchase' : 'Sale'}`;

        orderInfo.appendChild(productName);
        orderInfo.appendChild(productId);
        orderInfo.appendChild(quantity);
        orderInfo.appendChild(type);
    });

    const generateBillButton = document.createElement('button');
    generateBillButton.textContent = 'Generate Bill';
    generateBillButton.addEventListener('click', () => generateBill(order));

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
        <input type="text" name="productName" placeholder="Product Name" required>
        <input type="number" name="productId" placeholder="Product ID" required>
        <input type="number" name="quantity" placeholder="Quantity" required>
        <select name="type" required>
            <option value="" disabled selected>Select Type</option>
            <option value="p">Purchase</option>
            <option value="s">Sale</option>
        </select>
    `;
    orderItemsContainer.appendChild(newItem);
}

async function addOrder(e) {
    e.preventDefault();

    const customerId = document.querySelector('input[name="customerId"]').value;
    const orderItems = document.querySelectorAll('.order-item');

    const items = [];
    orderItems.forEach(item => {
        const productName = item.querySelector('input[name="productName"]').value;
        const productId = item.querySelector('input[name="productId"]').value;
        const quantity = item.querySelector('input[name="quantity"]').value;
        const type = item.querySelector('select[name="type"]').value;
        items.push({ productName, productId, quantity, type });
    });

    const newOrder = { customerId, items };

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
        document.getElementById('order-items').innerHTML = `
            <div class="order-item">
                <input type="text" name="productName" placeholder="Product Name" required>
                <input type="number" name="productId" placeholder="Product ID" required>
                <input type="number" name="quantity" placeholder="Quantity" required>
                <select name="type" required>
                    <option value="" disabled selected>Select Type</option>
                    <option value="p">Purchase</option>
                    <option value="s">Sale</option>
                </select>
            </div>
        `;
        fetchOrders(); // Fetch and display updated orders
    } catch (error) {
        console.error('Error adding order:', error);
        alert('Error adding order. Please try again.');
    }
}

function generateBill(order) {
    let billContent = `<p>Customer ID: ${order.CustomerId}</p>`;
    let totalCost = 0;

    order.Items.forEach((item, index) => {
        const price = Math.floor(Math.random() * 100) + 1; // Assuming random price for demonstration
        totalCost += price * item.Quantity;

        billContent += `
            <p>Item ${index + 1}:</p>
            <p>Product Name: ${item.ProductName}</p>
            <p>Product ID: ${item.ProductId}</p>
            <p>Quantity: ${item.Quantity}</p>
            <p>Type: ${item.Type === 'p' ? 'Purchase' : 'Sale'}</p>
            <p>Price: $${price}</p>
            <p>Cost: $${price * item.Quantity}</p>
            <hr>
        `;
    });

    billContent += `<p>Total Cost: $${totalCost}</p>`;

    document.getElementById('bill-content').innerHTML = billContent;
    document.getElementById('bill-details').style.display = 'block';
}

function searchOrders() {
    const searchText = this.value.toLowerCase();
    const filteredOrders = orders.filter(order => {
        return order.CustomerId.toLowerCase().includes(searchText) ||
            order.Items.some(item => item.ProductId.toLowerCase().includes(searchText));
    });
    displayOrders(filteredOrders);
}
