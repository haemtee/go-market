const { validationResult } = require("express-validator");

const Product = require("../models/product");

exports.addProduct = (req, res, next) => {
  const errors = validationResult(req);
  console.log("error dari validation result =", errors);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }
};
