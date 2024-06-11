let orders = [
    { id: 12345, customerId: "1", productId: "3", quantity: 1, price: 999.99 },
    { id: 12346, customerId: "2", productId: "4", quantity: 2, price: 599.99 }
];

document.addEventListener('DOMContentLoaded', function() {
    displayOrders();
    document.getElementById('search').addEventListener('input', searchOrders);
    document.querySelector('.add-order-form button').addEventListener('click', addOrder);
});

function displayOrders() {
    const ordersList = document.querySelector('.orders-list');
    ordersList.innerHTML = '';

    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');

        const orderInfo = document.createElement('div');
        orderInfo.classList.add('order-info');

        const orderId = document.createElement('h2');
        orderId.textContent = `Order ID: #${order.id}`;

        const customer = document.createElement('p');
        customer.textContent = `Customer ID: ${order.customerId}`;

        const product = document.createElement('p');
        product.textContent = `Product ID: ${order.productId}`;

        const quantity = document.createElement('p');
        quantity.textContent = `Quantity: ${order.quantity}`;

        const price = document.createElement('p');
        price.textContent = `Price: $${order.price}`;

        orderInfo.appendChild(orderId);
        orderInfo.appendChild(customer);
        orderInfo.appendChild(product);
        orderInfo.appendChild(quantity);
        orderInfo.appendChild(price);

        orderElement.appendChild(orderInfo);
        ordersList.appendChild(orderElement);
    });
}

function addOrder() {
    const orderId = document.querySelector('input[name="orderId"]').value;
    const customerId = document.querySelector('input[name="customerId"]').value;
    const productId = document.querySelector('input[name="productId"]').value;
    const quantity = document.querySelector('input[name="quantity"]').value;
    const price = document.querySelector('input[name="price"]').value;

    const newOrder = { id: orderId, customerId: customerId, productId: productId, quantity: quantity, price: price };
    orders.push(newOrder);
    displayOrders();

    // Reset the form fields
    document.querySelector('.add-order-form').reset();
}

function searchOrders() {
    const searchText = this.value.toLowerCase();
    const filteredOrders = orders.filter(order => {
        return order.customerId.toLowerCase().includes(searchText) ||
               order.productId.toLowerCase().includes(searchText);
    });
    displayFilteredOrders(filteredOrders);
}

function displayFilteredOrders(filteredOrders) {
    const ordersList = document.querySelector('.orders-list');
    ordersList.innerHTML = '';

    filteredOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');

        const orderInfo = document.createElement('div');
        orderInfo.classList.add('order-info');

        const orderId = document.createElement('h2');
        orderId.textContent = `Order ID: #${order.id}`;

        const customer = document.createElement('p');
        customer.textContent = `Customer ID: ${order.customerId}`;

        const product = document.createElement('p');
        product.textContent = `Product ID: ${order.productId}`;

        const quantity = document.createElement('p');
        quantity.textContent = `Quantity: ${order.quantity}`;

        const price = document.createElement('p');
        price.textContent = `Price: $${order.price}`;

        orderInfo.appendChild(orderId);
        orderInfo.appendChild(customer);
        orderInfo.appendChild(product);
        orderInfo.appendChild(quantity);
        orderInfo.appendChild(price);

        orderElement.appendChild(orderInfo);
        ordersList.appendChild(orderElement);
    });
}
