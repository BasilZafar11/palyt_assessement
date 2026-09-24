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

    stock.forEach((ingredient) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${ingredient.name}</td>
            <td>${ingredient.qty}</td>
            <td>${ingredient.unit}</td>
            <td>${ingredient.par}</td>
        `;

        tableBody.appendChild(row);
    });
}

loadStock();