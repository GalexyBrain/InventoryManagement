document.addEventListener('DOMContentLoaded', function() {
    // Sample inventory items
    const items = [
        { id: 1, name: 'Product A', quantity: 50, price: 10 },
        { id: 2, name: 'Product B', quantity: 30, price: 20 }
    ];

    const inventoryList = document.querySelector('.inventory-list');

    // Function to add item
    function addItem(item) {
        const newItem = document.createElement('div');
        newItem.className = 'inventory-item';
        newItem.innerHTML = `
            <div class="item-info">
                <h2>Product ID: ${item.id}</h2>
                <h2>Item Name: ${item.name}</h2>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: $${item.price}</p>
            </div>
        `;
        inventoryList.appendChild(newItem);
    }

    // Add initial items
    items.forEach(item => addItem(item));

    // Event listener for adding a new item
    const addItemForm = document.querySelector('.add-item-form');
    addItemForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const productId = this.productId.value;
        const itemName = this.itemName.value;
        const quantity = this.quantity.value;
        const price = this.price.value;
        addItem({ id: productId, name: itemName, quantity: quantity, price: price });
        this.reset();
    });

    // Search functionality
    document.getElementById('search').addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        const filteredItems = items.filter(item => {
            return item.name.toLowerCase().includes(searchText) || 
                   item.id.toString().includes(searchText) || 
                   item.price.toString().includes(searchText) || 
                   item.quantity.toString().includes(searchText);
        });
        inventoryList.innerHTML = '';
        filteredItems.forEach(item => addItem(item));
    });
});
