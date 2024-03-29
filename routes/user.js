const express = require("express");
const { body } = require("express-validator");
const { requireAuth, isIdExist } = require("../controller/userMiddleware");
const upload = require("../uploadMiddleware");
const router = express.Router();

const userController = require("../controller/user");

const userValidate = [
  body("username")
    .isLength({ min: 5 })
    .withMessage("Username minimal 5 karakter"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password minimal 5 karakter"),
  body("roles")
    .matches(/\b(?:admin|buyer|seller)\b/)
    .withMessage("Role tidak sesuai"),
  body("name").isLength({ min: 4 }).withMessage("Nama minimal 4 karakter"),
  body("phone")
    .isLength({ min: 5 })
    .matches(/^\d+$/)
    .withMessage("Input yang diterima hanya berupa angka"),
  body("address").isLength({ min: 8 }).withMessage("Isi alamat kurang lengkap"),
  body("city").isLength({ min: 4 }).withMessage("Kota minimal 4 karakter"),

  body("store_name")
    .optional()
    .isLength({ min: 4 })
    .withMessage("Nama toko minimal 4 karakter"),
  body("store_pic").optional().isString().withMessage("Hanya menerima string"),
];

const loginValidate = [
  body("username")
    .isLength({ min: 5 })
    .withMessage("Username minimal 5 karakter"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password minimal 5 karakter"),
];

const editUserValidate = [
  body("password")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Password minimal 5 karakter"),
  body("name")
    .optional()
    .isLength({ min: 4 })
    .withMessage("Nama minimal 4 karakter"),
  body("phone")
    .optional()
    .matches(/^\d+$/)
    .withMessage("Input yang diterima hanya berupa angka"),
  body("address")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Isi alamat kurang lengkap"),
  body("city")
    .optional()
    .isLength({ min: 4 })
    .withMessage("Kota minimal 4 karakter"),
  body("avatar").optional().isString().withMessage("Hanya menerima string"),
  body("store_name")
    .optional()
    .isLength({ min: 4 })
    .withMessage("Nama toko minimal 4 karakter"),
  body("store_pic").optional().isString().withMessage("Hanya menerima string"),
];

// ? USER ROUTER
// !POST {base.api}/v1/user/register REGISTER NEW USER and return Cookie
router.post(
  "/register",
  upload.uploadUser.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "store_pic",
      maxCount: 1,
    },
  ]),
  userValidate,
  userController.register
);

// !POST {base.api}/v1/user/login return cookie exclude password
router.post("/login", loginValidate, userController.login);

// !GET {base.api}/v1/user/logout  remove cookie doesnt return anything
router.get("/logout", userController.logout);

// !GET {base.api}/v1/user/users  GET ALL USER exclude password
// * COOKIE WITH ADMIN ROLES CAN ACCESS THIS LINK
router.get("/users", requireAuth, userController.getAllUser);

// !GET {base.api}/v1/user/:id  GET USER by id
// * COOKIE VALIDATED CAN ACCESS THIS
router.get("/:id", requireAuth, isIdExist, userController.getUser);

// !GET {base.api}/v1/user/:id  GET USER from cookies
router.get("/", requireAuth, userController.getOwnId);

// !PATCH {base.api}/v1/user/:id  EDIT USER by id cant edit roles or username
// * COOKIE VALIDATED & ONLY EDIT OWN ID ACCESS
router.patch(
  "/:id",
  requireAuth,
  upload.uploadUser.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "store_pic",
      maxCount: 1,
    },
  ]),
  isIdExist,
  editUserValidate,
  userController.editUser
);

// !DELETE {base.api}/v1/user/:id  DELET USER by id
// * COOKIE VALIDATED & ONLY DELETE OWN ID ACCESS
router.delete("/:id", requireAuth, isIdExist, userController.deleteUser);

module.exports = router;
