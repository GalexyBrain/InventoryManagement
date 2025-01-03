let inventory = [];

document.querySelector('.add-item-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const itemId = e.target.elements.productId.value;
    const itemName = e.target.elements.itemName.value;
    const quantity = e.target.elements.quantity.value;
    const price = e.target.elements.price.value;

    try {
        const response = await fetch('http://13.201.225.19/api/inventory', {
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
        const response = await fetch('http://13.201.225.19/api/inventory');
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
        `;

        inventoryList.appendChild(itemDiv);
    });
}

// Implement search functionality
document.getElementById('search').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const filteredInventory = inventory.filter(item => {
        return item.Name.toLowerCase().includes(searchText);
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
                <p><strong>ID:</strong> ${item.Id}</p>
                <p><strong>Name:</strong> ${item.Name}</p>
                <p><strong>Quantity:</strong> ${item.Quantity}</p>
                <p><strong>Price:</strong> ₹${item.Price}</p>
            </div>
        `;

        inventoryList.appendChild(itemDiv);
    });
}

// Fetch inventory on initial load
fetchInventory();
