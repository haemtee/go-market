const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../controller/userMiddleware");
const router = express.Router();

const productController = require("../controller/product");

// ? PRODUCT ROUTER
// !POST {base.api}/v1/product/add  ADD NEW PRODUCT
router.post("/add", requireAuth, productController.addProduct);

module.exports = router;
