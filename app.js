let stock = [];

async function loadStock() {
    try {
        const response = await fetch("stock.json");

        if (!response.ok) {
            throw new Error("Could not load stock data");
        }

        stock = await response.json();
        renderStock();
    } catch (error) {
        console.error("Error loading stock:", error);
    }
}

function renderStock() {
    const tableBody = document.getElementById("stock-table-body");

    tableBody.innerHTML = "";

    stock.forEach((ingredient, index) => {
        const row = document.createElement("tr");

        const isLowStock = ingredient.qty < ingredient.par;
        const statusText = isLowStock ? "Low Stock" : "In Stock";
        const statusClass = isLowStock ? "status-low" : "status-ok";

        row.innerHTML = `
            <td>${ingredient.name}</td>
            <td>${ingredient.qty}</td>
            <td>${ingredient.unit}</td>
            <td>${ingredient.par}</td>
            <td>
                <span class="stock-status ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td>
                <button class="edit-button" onclick="editQuantity(${index})">
                    Edit
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function editQuantity(index) {
    const ingredient = stock[index];

    const newQuantity = prompt(
        `Enter new quantity for ${ingredient.name} (${ingredient.unit}):`,
        ingredient.qty
    );

    if (newQuantity === null) {
        return;
    }

    const quantity = Number(newQuantity);

    if (!Number.isFinite(quantity) || quantity < 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    ingredient.qty = quantity;

    renderStock();
}

loadStock();