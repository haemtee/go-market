const Product = require("../models/product");

const isProductExist = async (req, res, next) => {
  const idProduct = req.params.id;

  if (idProduct.length != 24) {
    res.status(403).json({
      message: "Error ID Product salah",
    });
  }
  try {
    const result = await Product.findOne({ _id: idProduct });
    // jika tidak ada maka
    if (result == null) {
      //console.log("result length = null");
      res.status(403).json({
        message: "Error Product tidak ditemukan",
      });
      // jika user ditemukan maka
    } else if (result != null) {
      //   console.log("is id product exist :", result);
      req.isProductExist = result;
      next();
    }
  } catch {
    (err) => {
      console.log(err);
      throw err;
    };
  }
};

module.exports = { isProductExist };
