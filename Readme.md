# Palyt Kitchen Inventory

A small kitchen inventory and diner menu application built for the Palyt Software Developer Intern take-home task.

The application connects stock levels with recipe availability. Staff can manage ingredients and a diner can place an order, which deducts the required ingredients and updates menu availability.

## Features

### Stock Management

- View ingredient name, quantity, unit, par level and stock status
- Search ingredients by name
- Add new ingredients
- Edit quantity and par level
- Delete unused ingredients
- Prevent deletion when an ingredient is used by a recipe
- Validate quantities, par levels, units and duplicate ingredient names

### Diner Menu

- View dishes and prices
- Show dishes as Available or Unavailable
- Disable ordering for unavailable dishes
- Deduct recipe ingredients when an order is placed
- Recalculate menu availability after stock changes
- Restocking can make dishes available again
- Raising a par level can make dishes unavailable

## Running the Application

The application uses `fetch()` to load the supplied JSON files, so it should be served through a local HTTP server rather than opening `index.html` directly.

From the project directory run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

No database, login or backend service is required.

Stock changes are kept in memory and reset when the page is refreshed.

## Running Tests

Run:

```bash
python -m unittest test_logic.py -v
```

The tests cover unit conversion, including:

- grams to kilograms
- kilograms to grams
- litres to millilitres
- quantities already using the same unit
- unsupported conversions

Browser testing was also used for the complete stock -> order -> deduction -> availability flow.

## Availability Rule

I followed the task rule literally:

```text
quantity < par -> ingredient is below par
quantity >= par -> ingredient is in stock
```

A dish is unavailable if any required ingredient is below its par level.

If a recipe references an ingredient that does not exist in the stock data, I also mark that dish unavailable because the kitchen cannot reliably fulfil the recipe.

The supplied data contains two examples of this:

- `Cumin Seeds` is required by recipes but is missing from `stock.json`.
- `Refined Flour` is required by Butter Naan but is missing from `stock.json`.

Adding the missing ingredient through the stock interface can make the affected dishes available.

## Unit Handling

Recipes and stock do not always use the same units.

For example, Paneer is stored in kilograms while recipes consume Paneer in grams.

Before deducting an ingredient, the recipe quantity is converted into the stock ingredient's unit.

Example:

```text
Paneer stock: 1.4 kg
Recipe requirement: 180 g

180 g = 0.18 kg

1.4 - 0.18 = 1.22 kg
```

The conversion logic supports:

```text
g <-> kg
ml <-> l
```

Matching units require no conversion.

I manually checked several conversions in addition to the automated tests.

## Ordering

Before changing inventory, an order first checks every required ingredient.

Only after all checks pass are quantities deducted. This avoids partially deducting stock if one ingredient cannot satisfy the order.

After an order, both the stock table and menu availability are recalculated.

I also prevent an order from producing a negative stock quantity even if the current par-based availability rule says the dish is available.

## Deleting Ingredients

I chose to block deletion when an ingredient is referenced by a recipe.

For example, `Cashews` cannot be deleted because multiple dishes depend on it.

An unused ingredient such as `Bay Leaves` can be deleted.

I chose this behavior because silently deleting a recipe dependency could leave the menu in an inconsistent state.

## Assumptions and Edge Cases

- Stock changes are intentionally stored only in browser memory.
- Ingredient names are matched case-insensitively but otherwise require an exact name.
- Quantities and par levels cannot be negative.
- New ingredients must use `g`, `kg`, `ml`, or `l`.
- Duplicate ingredient names are rejected.
- Missing recipe ingredients make a dish unavailable.
- Unsupported unit conversions stop an order instead of guessing a conversion.

One limitation of the supplied availability rule is that being above par does not necessarily mean there is enough stock to prepare another full portion.

For example, an ingredient can technically be above its par level while still having less quantity than a recipe requires. For that reason, the order flow performs an additional quantity check before deducting inventory.

If I were extending the product, I would separate "below par" from "can fulfil another portion" so the diner-facing availability calculation reflects whether the kitchen can actually prepare the dish.

## Testing Approach

I tested the main workflow manually in the browser:

1. Load stock and recipes.
2. Verify low-stock ingredients affect dishes.
3. Edit quantities and par levels.
4. Add missing ingredients and confirm affected dishes become available.
5. Place an order and verify each ingredient deduction.
6. Confirm crossing a par level updates all dependent dishes.
7. Restock an ingredient and confirm dishes become available again.
8. Test duplicate names and invalid units.
9. Verify recipe ingredients cannot be deleted.
10. Verify unused ingredients can be deleted.
11. Test stock search.
12. Run the Python unit tests.

The Python tests focus on the isolated conversion calculations. They do not test DOM rendering or browser event wiring, so those parts are covered by the manual browser checks.

## AI Usage

I used ChatGPT as a development assistant during the task.

Mainly used it for creating the Readme.md file
and other task are writing the logic at someplaces