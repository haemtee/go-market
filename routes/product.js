const express = require("express");
const { body } = require("express-validator");
const { requireAuth, isIdExist } = require("../controller/userMiddleware");
const { isProductExist } = require("../controller/productMiddleware");
const upload = require("../uploadMiddleware");
const router = express.Router();

const productController = require("../controller/product");

const productValidate = [
  body("name").isLength({ min: 5 }).withMessage("Product minimal 5 karakter"),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Deskripsi minimal 10 karakter"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Harga harus berupa angka dan tidak boleh minus"),
  body("stock")
    .isFloat({ min: 0 })
    .withMessage("Stock harus berupa angka dan tidak boleh minus"),
];

const editValidate = [
  body("name")
    .isLength({ min: 5 })
    .optional()
    .withMessage("Product minimal 5 karakter"),
  body("description")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Deskripsi minimal 10 karakter"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Harga harus berupa angka dan tidak boleh minus"),
  body("stock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Stock harus berupa angka dan tidak boleh minus"),
  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available hanya menerima boolean"),
  body("promoted")
    .optional()
    .isBoolean()
    .withMessage("Promoted hanya menerima boolean"),
];

// ? PRODUCT ROUTER
// !POST {base.api}/v1/product/add  ADD NEW PRODUCT
router.post(
  "/add",
  requireAuth,
  upload.uploadProduct.single("image"),
  productValidate,
  productController.addProduct
);

// !GET {base.api}/v1/product/products  GET ALL PRODUCT
router.get("/products", productController.getAllProduct);

// !GET {base.api}/v1/product/promoted  GET ALL PROMOTED PRODUCT
router.get("/promoted", productController.getPromotedProduct);

// !GET {base.api}/v1/product/:id   GET PRODUCT BY PRODUCT ID
router.get("/:id", isProductExist, productController.getProductById);

// !GET {base.api}/v1/product/:seller   GET ALL PRODUCT BY SELLER ID
router.get("/seller/:id", isIdExist, productController.getProductBySeller);

// !GET {base.api}/v1/product/:name   GET ALL PRODUCT BY PRODUCT NAME
router.get("/name/:name", productController.getProductByName);

// !DELETE {base.api}/v1/product/:id   DELETE PRODUCT BY PRODUCT ID
router.delete(
  "/:id",
  requireAuth,
  isProductExist,
  productController.deleteProductById
);

// !EDIT {base.api}/v1/product/:id   EDIT PRODUCT BY PRODUCT ID
router.patch(
  "/:id",
  requireAuth,
  upload.uploadProduct.single("image"),
  editValidate,
  isProductExist,
  productController.editProductbyId
);

module.exports = router;
