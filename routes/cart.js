const express = require("express");

const { body } = require("express-validator");
const { requireAuth, isIdExist } = require("../controller/userMiddleware");

const cartController = require("../controller/cart");

const router = express.Router();

const cartValidation = [
  body("product_id")
    .isLength({ min: 24, max: 24 })
    .withMessage("Product id tidak valid"),
  body("quantity")
    .isFloat({ min: 0 })
    .withMessage("Kuantiti tidak boleh minus"),
];
// ! POST
// ! {base.api}/v1/cart/:id   => add cart by id (buyer)
router.post(
  "/:id",
  requireAuth,
  isIdExist,
  cartValidation,
  cartController.addProductToCart
);

// ! GET
// ! {base.api}/v1/cart/:id  => get cart by id (buyer)
router.get("/:id", requireAuth, isIdExist, cartController.getCart);

// !!DELETE
// ! {base.api}/v1/cart/:id  => delete cart by id (buyer)
router.delete("/:id", requireAuth, isIdExist, cartController.deleteAllCart);

module.exports = router;
