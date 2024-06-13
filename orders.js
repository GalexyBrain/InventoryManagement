let orders = [];

document.addEventListener('DOMContentLoaded', function () {
    fetchOrders();
    document.getElementById('search').addEventListener('input', searchOrders);
    document.getElementById('submit').addEventListener('click', addOrder);
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

    const productId = document.createElement('p');
    productId.textContent = `Product ID: ${order.ProductId}`;

    const quantity = document.createElement('p');
    quantity.textContent = `Quantity: ${order.Quantity}`;

    const price = document.createElement('p');
    price.textContent = `Price: $${order.Price}`;

    const type = document.createElement('p');
    type.textContent = `Type: ${order.Type === 'p' ? 'Purchase' : 'Sale'}`;

    orderInfo.appendChild(customerId);
    orderInfo.appendChild(productId);
    orderInfo.appendChild(quantity);
    orderInfo.appendChild(price);
    orderInfo.appendChild(type);

    orderElement.appendChild(orderId);
    orderElement.appendChild(orderInfo);

    return orderElement;
}

async function addOrder(e) {
    e.preventDefault();

    const customerId = document.querySelector('input[name="customerId"]').value;
    const productId = document.querySelector('input[name="productId"]').value;
    const quantity = document.querySelector('input[name="quantity"]').value;
    const type = document.querySelector('select[name="type"]').value;

    const newOrder = { customerId, productId, quantity, type };

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
        document.querySelector('input[name="productId"]').value = '';
        document.querySelector('input[name="quantity"]').value = '';
        document.querySelector('select[name="type"]').value = '';
        fetchOrders(); // Fetch and display updated orders
    } catch (error) {
        console.error('Error adding order:', error);
        alert('Error adding order. Please try again.');
    }
}

function searchOrders() {
    const searchText = this.value.toLowerCase();
    const filteredOrders = orders.filter(order => {
        return order.CustomerId.toLowerCase().includes(searchText) ||
            order.ProductId.toLowerCase().includes(searchText);
    });
    displayOrders(filteredOrders);
}
