let stock = [];
let recipes = [];

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

async function loadRecipes() {
    try {
        const response = await fetch("recipes.json");

        if (!response.ok) {
            throw new Error("Could not load recipe data");
        }

        recipes = await response.json();
        renderMenu();
    } catch (error) {
        console.error("Error loading recipes:", error);
    }
}

function renderMenu() {
    const menuList = document.getElementById("menu-list");

    menuList.innerHTML = "";

    recipes.forEach((recipe) => {
        const available = isDishAvailable(recipe);

        const menuItem = document.createElement("div");
        menuItem.className = "menu-item";

        menuItem.innerHTML = `
            <div>
                <h3>${recipe.dish}</h3>
                <p>₹${recipe.price}</p>
                <span class="menu-status ${
                    available ? "menu-available" : "menu-unavailable"}">
                    ${available ? "Available" : "Unavailable"}
                </span>
            </div>
        `;

        menuList.appendChild(menuItem);
    });
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
                <button class="edit-button" onclick="editIngredient(${index})">
                    Edit
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function editIngredient(index) {
    const ingredient = stock[index];

    const newQuantity = prompt(
        `Enter quantity for ${ingredient.name} (${ingredient.unit}):`,
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

    const newPar = prompt(
        `Enter par level for ${ingredient.name} (${ingredient.unit}):`,
        ingredient.par
    );

    if (newPar === null) {
        return;
    }

    const par = Number(newPar);

    if (!Number.isFinite(par) || par < 0) {
        alert("Please enter a valid par level.");
        return;
    }

    ingredient.qty = quantity;
    ingredient.par = par;

    renderStock();
    renderMenu();
}

loadStock();
loadRecipes();

function convertQuantity(quantity, fromUnit, toUnit) {
    if (fromUnit === toUnit) {
        return quantity;
    }

    if (fromUnit === "kg" && toUnit === "g") {
        return quantity * 1000;
    }

    if (fromUnit === "g" && toUnit === "kg") {
        return quantity / 1000;
    }

    if (fromUnit === "l" && toUnit === "ml") {
        return quantity * 1000;
    }

    if (fromUnit === "ml" && toUnit === "l") {
        return quantity / 1000;
    }

    throw new Error(`Unsupported unit conversion: ${fromUnit} to ${toUnit}`);
}

function findStockIngredient(name) {
    return stock.find(
        (ingredient) =>
            ingredient.name.toLowerCase() === name.toLowerCase()
    );
}

function isDishAvailable(recipe) {
    return recipe.ingredients.every((recipeIngredient) => {
        const stockIngredient = findStockIngredient(recipeIngredient.name);

        if (!stockIngredient) {
            return false;
        }

        return stockIngredient.qty >= stockIngredient.par;
    });
}