def convert_quantity(quantity, from_unit, to_unit):
    if from_unit == to_unit:
        return quantity

    conversions = {
        ("kg", "g"): 1000,
        ("g", "kg"): 0.001,
        ("l", "ml"): 1000,
        ("ml", "l"): 0.001,
    }

    conversion = conversions.get((from_unit, to_unit))

    if conversion is None:
        raise ValueError(
            f"Unsupported unit conversion: {from_unit} to {to_unit}"
        )

    return quantity * conversion