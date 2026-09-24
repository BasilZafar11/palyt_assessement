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

    recipes.forEach((recipe,index) => {
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
                <button
                    class="order-button"
                    onclick="placeOrder(${index})"
                    ${available ? "" : "disabled"}>
                    Order
                </button>
            </div>
        `;

        menuList.appendChild(menuItem);
    });
}

function getIngredientDependencies(name) {
    return recipes
        .filter((recipe) =>
            recipe.ingredients.some(
                (ingredient) =>
                    ingredient.name.toLowerCase() === name.toLowerCase()
            )
        )
        .map((recipe) => recipe.dish);
}

function renderStock() {
    const tableBody = document.getElementById("stock-table-body");
    const searchInput = document.getElementById("stock-search");

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    tableBody.innerHTML = "";

    stock.forEach((ingredient, index) => {
        if (
            searchTerm &&
            !ingredient.name.toLowerCase().includes(searchTerm)
        ) {
            return;
        }
        
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
                
                <button class="delete-button" onclick="deleteIngredient(${index})">
                    Delete
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

function deleteIngredient(index) {
    const ingredient = stock[index];
    const dependencies = getIngredientDependencies(ingredient.name);

    if (dependencies.length > 0) {
        alert(
            `${ingredient.name} cannot be deleted because it is used by: ${dependencies.join(", ")}`
        );
        return;
    }

    const confirmed = confirm(
        `Delete ${ingredient.name} from stock?`
    );

    if (!confirmed) {
        return;
    }

    stock.splice(index, 1);

    renderStock();
    renderMenu();
}

function addIngredient() {
    const name = prompt("Enter ingredient name:");

    if (name === null) {
        return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
        alert("Ingredient name cannot be empty.");
        return;
    }

    const duplicateIngredient = stock.some(
        (ingredient) =>
            ingredient.name.toLowerCase() === trimmedName.toLowerCase());

    if (duplicateIngredient) {
        alert("An ingredient with this name already exists.");
        return;
    }

    const quantityInput = prompt("Enter quantity:");

    if (quantityInput === null) {
        return;
    }

    const quantity = Number(quantityInput);

    if (!Number.isFinite(quantity) || quantity < 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    const unit = prompt("Enter unit (g, kg, ml, or l):");

    if (unit === null) {
        return;
    }

    const normalizedUnit = unit.trim().toLowerCase();

    const allowedUnits = ["g", "kg", "ml", "l"];

    if (!allowedUnits.includes(normalizedUnit)) {
        alert("Unit must be g, kg, ml, or l.");
        return;
    }

    const parInput = prompt("Enter par level:");

    if (parInput === null) {
        return;
    }

    const par = Number(parInput);

    if (!Number.isFinite(par) || par < 0) {
        alert("Please enter a valid par level.");
        return;
    }

    stock.push({
        name: trimmedName,
        qty: quantity,
        unit: normalizedUnit,
        par: par
    });

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

function placeOrder(recipeIndex) {
    const recipe = recipes[recipeIndex];

    if (!isDishAvailable(recipe)) {
        alert(`${recipe.dish} is currently unavailable.`);
        return;
    }

    for (const recipeIngredient of recipe.ingredients) {
        const stockIngredient = findStockIngredient(recipeIngredient.name);

        if (!stockIngredient) {
            alert(`${recipeIngredient.name} is missing from stock.`);
            return;
        }

        let requiredQuantity;

        try {
            requiredQuantity = convertQuantity(
                recipeIngredient.qty,
                recipeIngredient.unit,
                stockIngredient.unit
            );
        } catch (error) {
            alert(error.message);
            return;
        }

        if (stockIngredient.qty < requiredQuantity) {
            alert(`Not enough ${stockIngredient.name} to complete this order.`);
            return;
        }
    }

    recipe.ingredients.forEach((recipeIngredient) => {const stockIngredient = findStockIngredient(recipeIngredient.name);

        const requiredQuantity = convertQuantity(
            recipeIngredient.qty,
            recipeIngredient.unit,
            stockIngredient.unit
        );

        stockIngredient.qty -= requiredQuantity;

        stockIngredient.qty = Math.round(stockIngredient.qty * 1000) / 1000;
    });

    renderStock();
    renderMenu();

    alert(`${recipe.dish} ordered successfully.`);
}