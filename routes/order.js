const express = require("express");
const { body } = require("express-validator");
const { requireAuth, isIdExist } = require("../controller/userMiddleware");
const router = express.Router();

const orderController = require("../controller/order");

const orderValidate = [
  // buyer id diambil dari token, seller id diambil dr params
  // grandtotal dihitung di controller
  body("products")
    .isArray()
    .notEmpty()
    .withMessage("Products harus berisi array"),
  body("arr.*.product_id")
    .isLength({ min: 24, max: 24 })
    .withMessage("Product id tidak valid"),
  body("arr.*.quantity")
    .isFloat({ min: 1 })
    .withMessage("Kuantiti tidak boleh dibawah 1"),
  body("buyer_name")
    .isString({ min: 4 })
    .withMessage("Nama minimal 4 karakter"),
  body("buyer_phone")
    .isLength({ min: 5 })
    .matches(/^\d+$/)
    .withMessage("Input yang diterima hanya berupa angka"),
  body("shipping_address")
    .isLength({ min: 8 })
    .withMessage("Isi alamat kurang lengkap"),
  body("buyer_city")
    .isLength({ min: 4 })
    .withMessage("Kota minimal 4 karakter"),
  body("note").optional().isString(),
];
const statusOrderValidate = [
  body("status").matches(/\b(?:processing|sending|received|cancel)\b/),
];

// !POST
// !{base.api}/v1/order/seller/:id      => add order by id user (seller)
router.post(
  "/seller/:id",
  requireAuth,
  isIdExist,
  orderValidate,
  orderController.addOrderBySellerId
);

// !GET
// !{base.api}/v1/order/        => get all order from id token, if admin get all orders
router.get("/", requireAuth, orderController.getAllOrders);

// !{base.api}/v1/order/:id     => get order by id, owner or admin only
router.get("/:id", requireAuth, orderController.getByOrderId);

// !PATCH
// !{base.api}/v1/order/:id     => edit status order by id, owner if seller status = sending,
// !                               if buyer (status = received / cancel), if seller (status = sending / cancel) or admin only
router.patch(
  "/:id",
  requireAuth,
  statusOrderValidate,
  orderController.editStatusOrder
);

module.exports = router;
