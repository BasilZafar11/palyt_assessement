import unittest

from logic import convert_quantity


class TestInventoryLogic(unittest.TestCase):

    def test_grams_to_kilograms(self):
        self.assertEqual(
            convert_quantity(180, "g", "kg"),
            0.18
        )

    def test_kilograms_to_grams(self):
        self.assertEqual(
            convert_quantity(1.4, "kg", "g"),
            1400
        )

    def test_same_unit(self):
        self.assertEqual(
            convert_quantity(40, "ml", "ml"),
            40
        )

    def test_litres_to_millilitres(self):
        self.assertEqual(
            convert_quantity(1, "l", "ml"),
            1000
        )

    def test_invalid_conversion(self):
        with self.assertRaises(ValueError):
            convert_quantity(10, "g", "ml")


if __name__ == "__main__":
    unittest.main()