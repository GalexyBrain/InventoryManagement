let inventory = [];

document.querySelector('.add-item-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const itemId = e.target.elements.itemId.value;
    const itemName = e.target.elements.itemName.value;
    const quantity = e.target.elements.quantity.value;
    const price = e.target.elements.price.value;

    try {
        const response = await fetch('http://15.207.222.240/api/inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: itemId, name: itemName, qty: quantity, price: price })
        });

        if (response.ok) {
            alert('Item added successfully.');
            e.target.reset();
            fetchInventory();
        } else {
            alert('Failed to add item.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

async function fetchInventory() {
    try {
        const response = await fetch('http://15.207.222.240/api/inventory');
        const data = await response.json();
        inventory = data.inventory;
        renderInventory();
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

function renderInventory() {
    const inventoryList = document.querySelector('.inventory-list');
    inventoryList.innerHTML = '';

    inventory.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('inventory-item');

        itemDiv.innerHTML = `
            <div class="item-info">
                <p><strong>ID:</strong> ${item.Id}</p>
                <p><strong>Name:</strong> ${item.Name}</p>
                <p><strong>Quantity:</strong> ${item.Quantity}</p>
                <p><strong>Price:</strong> ₹${item.Price}</p>
            </div>
            <button class="edit-btn" onclick="editItem(${index})">Edit</button>
            <button class="restock-btn" onclick="restockItem(${index})">Restock</button>
            <button class="delete-btn" onclick="deleteItem(${index})">Delete</button>
        `;

        inventoryList.appendChild(itemDiv);
    });
}

async function editItem(index) {
    const item = inventory[index];
    const newItemName = prompt("Enter new name:", item.Name);
    const newPrice = prompt("Enter new price:", item.Price);

    try {
        const response = await fetch(`http://15.207.222.240/api/inventory/${item.Id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newItemName, price: newPrice })
        });

        if (response.ok) {
            fetchInventory();
        } else {
            alert('Failed to edit item.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function restockItem(index) {
    const item = inventory[index];
    const additionalQty = prompt("Enter quantity to add:", 0);

    try {
        const response = await fetch(`http://15.207.222.240/api/inventory/${item.Id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ qty: additionalQty, price: item.Price, id: item.Id })
        });

        if (response.ok) {
            fetchInventory();
        } else {
            alert('Failed to restock item.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteItem(index) {
    const item = inventory[index];

    if (confirm("Are you sure you want to delete this item?")) {
        try {
            const response = await fetch(`http://15.207.222.240/api/inventory/${item.Id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchInventory();
            } else {
                alert('Failed to delete item.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Implement search functionality
document.getElementById('search').addEventListener('input', function () {
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

// Fetch inventory on initial load
fetchInventory();
