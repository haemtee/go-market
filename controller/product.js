const { validationResult } = require("express-validator");

const Product = require("../models/product");

exports.addProduct = (req, res, next) => {
  const errors = validationResult(req);
  console.log("validation result =", errors);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }
  //console.log("cek =", req.userFromToken);
  if (req.userFromToken.roles != "seller") {
    return res.status(401).json({
      message: "Error, hanya Penjual yang bisa menambah produk ",
    });
  }
  const { name, description, price, stock } = req.body;
  const seller_id = req.userFromToken._id;
  let newProduct = {
    seller_id: seller_id,
    name: name,
    description: description,
    price: price,
    stock: stock,
    promoted: false,
  };
  // jika optional field ada maka tambahkan
  if (req.body.image) {
    newProduct = { ...newProduct, image: req.body.image };
  }
  if (req.body.stock < 1) {
    newProduct = { ...newProduct, available: false };
  }
  const Posting = new Product(newProduct);
  Posting.save()
    .then((result) => {
      res.status(201).json({
        message: "Add product Success",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
      console.log("error: " + err);
    });
};

exports.getAllProduct = (req, res, next) => {
  Product.find()
    .select("-promoted")
    .sort("-createdAt")
    .then((result) => {
      res.status(201).json({
        message: "Get all product success",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
      console.log("error: " + err);
    });
};

exports.getPromotedProduct = (req, res, next) => {
  Product.find({ promoted: true })
    .sort("-createdAt")
    .then((result) => {
      res.status(201).json({
        message: "Get all promoted product success",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
      console.log("error: " + err);
    });
};

exports.getProductBySeller = (req, res, next) => {
  Product.find({ seller_id: req.params.seller })
    .sort("-createdAt")
    .then((result) => {
      res.status(201).json({
        message: "Get all product by seller success",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
      console.log("error: " + err);
    });
};

exports.getProductById = (req, res, next) => {
  Product.find({ _id: req.params.id })
    .then((result) => {
      res.status(201).json({
        message: "Get product by product id success",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
      console.log("error: " + err);
    });
};

exports.getProductByName = (req, res, next) => {
  Product.find({ name: new RegExp(req.params.name, "i") })
    .then((result) => {
      res.status(201).json({
        message: "Get product by product name success",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
      console.log("error: " + err);
    });
};

// TODO SELESAIKAN INI
exports.deleteProductById = (req, res, next) => {
  // simpan fungsi hapus product
  const isAdmin = req.userFromToken.roles === "admin";
  console.log("is admin =", isAdmin);
  const id = req.userFromToken._id;
  const idProduct = req.params.id;
  // cari dlu apakah produk ada?
  Product.findOne({ _id: idProduct }).then((result) => {
    // jika tidak ada maka
    if (result === null) {
      console.log("result length = null");
      res.status(403).json({
        message: "Error produk tidak ditemukan",
      });
    }
    // jika produk ada maka coba cek
    if (result !== null) {
      // (compare object butuh di stringify)
      const sellerId = JSON.stringify(result.seller_id);
      const tokenId = JSON.stringify(id);
      // check apakah seller id sesuai dengan cookie? , jika tidak sesuai
      if (sellerId != tokenId) {
        // jika seller id tidak sesuai, apakah roles nya admin? jika ya hapus product by admin
        if (isAdmin) {
          Product.findOneAndDelete({ _id: idProduct })
            .then((result) => {
              res.status(201).json({
                message: "Delete product by admin success",
                data: result,
              });
            })
            .catch((err) => {
              console.log("error :", err);
              next();
            });
          // jika seller id tidak sesuai dan bukan admin, tampilkan error
        } else {
          res.status(401).json({
            message: "Hanya bisa menghapus product sendiri",
          });
        }
      }
      // jika seller id sesuai dengan cookie id
      if (sellerId === tokenId) {
        // hapus produck nya
        Product.findOneAndDelete({ _id: idProduct })
          .then((result) => {
            res.status(201).json({
              message: "Delete product success",
              data: result,
            });
          })
          .catch((err) => {
            console.log("error :", err);
            next();
          });
      }
    }
  });
};
