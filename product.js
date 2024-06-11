let inventory = [];

document.querySelector('.add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const itemId = e.target.elements.itemId.value;
    const itemName = e.target.elements.itemName.value;
    const quantity = e.target.elements.quantity.value;
    const price = e.target.elements.price.value;

    addItemToInventory(itemId, itemName, quantity, price);

    alert('Item added successfully.');
    e.target.reset();
});

function addItemToInventory(id, name, qty, price) {
    const item = { id, name, qty, price };
    inventory.push(item);
    renderInventory();
}

function renderInventory() {
    const inventoryList = document.querySelector('.inventory-list');
    inventoryList.innerHTML = '';

    inventory.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('inventory-item');
        
        itemDiv.innerHTML = `
            <div class="item-info">
                <p><strong>ID:</strong> ${item.id}</p>
                <p><strong>Name:</strong> ${item.name}</p>
                <p><strong>Quantity:</strong> ${item.qty}</p>
                <p><strong>Price:</strong> $${item.price}</p>
            </div>
            <button class="edit-btn" onclick="editItem(${index})">Edit</button>
            <button class="restock-btn" onclick="restockItem(${index})">Restock</button>
            <button class="delete-btn" onclick="deleteItem(${index})">Delete</button>
        `;

        inventoryList.appendChild(itemDiv);
    });
}

function editItem(index) {
    const item = inventory[index];
    const newItemName = prompt("Enter new name:", item.name);
    const newQty = prompt("Enter new quantity:", item.qty);
    const newPrice = prompt("Enter new price:", item.price);

    if (newItemName !== null) item.name = newItemName;
    if (newQty !== null) item.qty = newQty;
    if (newPrice !== null) item.price = newPrice;

    renderInventory();
}

function restockItem(index) {
    const item = inventory[index];
    const additionalQty = prompt("Enter quantity to add:", 0);

    if (additionalQty !== null) {
        item.qty = parseInt(item.qty) + parseInt(additionalQty);
        renderInventory();
    }
}

function deleteItem(index) {
    if (confirm("Are you sure you want to delete this item?")) {
        inventory.splice(index, 1);
        renderInventory();
    }
}

// Implement search functionality
document.getElementById('search').addEventListener('input', function() {
    const searchText = this.value.toLowerCase();
    const filteredInventory = inventory.filter(item => {
        return item.name.toLowerCase().includes(searchText);
    });
    renderFilteredInventory(filteredInventory);
});

function renderFilteredInventory(filteredInventory) {
    const inventoryList = document.querySelector('.inventory-list');
    inventoryList.innerHTML = '';

    filteredInventory.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('inventory-item');
        
        itemDiv.innerHTML = `
            <div class="item-info">
                <p><strong>ID:</strong> ${item.id}</p>
                <p><strong>Name:</strong> ${item.name}</p>
                <p><strong>Quantity:</strong> ${item.qty}</p>
                <p><strong>Price:</strong> $${item.price}</p>
            </div>
            <button class="edit-btn" onclick="editItem(${index})">Edit</button>
            <button class="restock-btn" onclick="restockItem(${index})">Restock</button>
            <button class="delete-btn" onclick="deleteItem(${index})">Delete</button>
        `;

        inventoryList.appendChild(itemDiv);
    });
}

// Add sample data initially
addSampleData();

function addSampleData() {
    addItemToInventory('1', 'Sample Item 1', 10, 20);
    addItemToInventory('2', 'Sample Item 2', 5, 30);
}
