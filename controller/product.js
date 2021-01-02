const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

const Product = require("../models/product");

exports.addProduct = (req, res, next) => {
  const errors = validationResult(req);
  //console.log("validation result =", errors);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }
  // cek file image
  if (!req.file) {
    return res.status(403).json({
      message: "Error, harus menambahkan image product",
    });
  }
  //console.log("cek =", req.userFromToken);
  if (req.userFromToken.roles != "seller") {
    return res.status(403).json({
      message: "Error, hanya Penjual yang bisa menambah produk ",
    });
  } else {
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

    newProduct = { ...newProduct, image: "/" + req.file.path };

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
  }
};

exports.getAllProduct = (req, res, next) => {
  Product.find({ available: true })
    .sort({ promoted: -1, createdAt: -1 })
    .then((result) => {
      res.status(200).json({
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
  Product.find({ promoted: true, available: true })
    .sort("-createdAt")
    .then((result) => {
      res.status(200).json({
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
  const isSeller = req.isIdExist.roles === "seller";

  if (isSeller === true) {
    Product.find({ seller_id: req.params.id, available: true })
      .sort("-createdAt")
      .then((result) => {
        res.status(200).json({
          message: "Get all product by seller success",
          data: result,
        });
      })
      .catch((err) => {
        next(err);
        console.log("error: " + err);
      });
  } else {
    res.status(402).json({
      message: "Error, bukan id seller",
    });
  }
};

exports.getProductById = (req, res, next) => {
  if (req.isProductExist.available === false) {
    res.status(404).json({
      message: "Error, produk tidak tersedia",
    });
  } else {
    Product.findOne({ _id: req.params.id })
      .then((result) => {
        res.status(200).json({
          message: "Get product by product id success",
          data: result,
        });
      })
      .catch((err) => {
        next(err);
        console.log("error: " + err);
      });
  }
};

exports.getProductByName = (req, res, next) => {
  Product.find({ name: new RegExp(req.params.name, "i") })
    .then((result) => {
      res.status(200).json({
        message: "Get product by product name success",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
      console.log("error: " + err);
    });
};

exports.deleteProductById = (req, res, next) => {
  const isAdmin = req.userFromToken.roles === "admin";
  const idToken = req.userFromToken._id;
  const idProduct = req.params.id;
  const dataProduct = req.isProductExist;

  // (compare object butuh di stringify)
  const sellerId = JSON.stringify(req.isProductExist.seller_id);
  const tokenId = JSON.stringify(idToken);
  // check apakah seller id sesuai dengan cookie? , jika tidak sesuai
  if (sellerId != tokenId) {
    // jika seller id tidak sesuai, apakah roles nya admin? jika ya hapus product by admin
    if (isAdmin) {
      Product.findOneAndDelete({ _id: idProduct })
        .then((result) => {
          removeImage(dataProduct.image);
          res.status(200).json({
            message: "Sukses menghapus product oleh admin",
            data: result,
          });
        })
        .catch((err) => {
          console.log("error :", err);
          next();
        });
      // jika seller id tidak sesuai dan bukan admin, tampilkan error
    } else {
      res.status(403).json({
        message: "Hanya bisa menghapus product sendiri",
      });
    }
  }
  // jika seller id sesuai dengan cookie id
  else if (sellerId === tokenId) {
    // hapus produck nya
    Product.findOneAndDelete({ _id: idProduct })
      .then((result) => {
        removeImage(dataProduct.image);
        res.status(200).json({
          message: "Sukses menghapus produk sendiri",
          data: result,
        });
      })
      .catch((err) => {
        console.log("error :", err);
        next();
      });
  }
};

exports.editProductbyId = (req, res, next) => {
  // validasi body
  const errors = validationResult(req);
  //console.log(errors);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  const idToken = req.userFromToken._id;
  const isAdmin = req.userFromToken.roles === "admin";
  const idProduct = req.params.id;
  const dataProduct = req.isProductExist;

  // (compare object butuh di stringify)
  const sellerId = JSON.stringify(req.isProductExist.seller_id);
  const tokenId = JSON.stringify(idToken);
  // check apakah seller id sesuai dengan cookie? , jika tidak sesuai
  if (sellerId != tokenId) {
    // jika seller id tidak sesuai, apakah roles nya admin? jika ya edit product by admin
    if (isAdmin) {
      let edit = {};
      for (const obj in req.body) {
        if (obj) {
          edit[obj] = req.body[obj];
        }
      }
      if (req.file) {
        edit = { ...edit, image: "/" + req.file.path };
        removeImage(dataProduct.image);
      }

      //console.log(edit);
      // tidak bisa ganti seller id
      if (edit.seller_id) delete edit.seller_id;
      edit.stock === 0 ? (edit.available = false) : (edit.available = true);
      // if (edit.promoted) delete edit.promoted;
      Product.updateOne({ _id: idProduct }, { $set: edit })
        .then((result) => {
          res.status(200).json({
            message: "Edit data by admin success",
            data: result,
          });
        })
        .catch((err) => {
          console.log("error :", err);
          next();
        });
      // jika seller id tidak sesuai dan bukan admin, tampilkan error
    } else {
      res.status(403).json({
        message: "Hanya bisa mengedit product sendiri",
      });
    }
  }
  // jika seller id sesuai dengan cookie id
  else if (sellerId === tokenId) {
    // edit product nya
    let edit = {};
    for (const obj in req.body) {
      if (obj) {
        edit[obj] = req.body[obj];
      }
    }

    if (req.file) {
      edit = { ...edit, image: "/" + req.file.path };
      removeImage(dataProduct.image);
    }
    // tidak bisa ganti seller id
    if (edit.seller_id) delete edit.seller_id;
    // bisa ganti promoted
    if (edit.promoted) delete edit.promoted;
    // jika stok 0 maka tidak available
    edit.stock === 0 ? (edit.available = false) : (edit.available = true);

    Product.updateOne({ _id: idProduct }, { $set: edit })
      .then((result) => {
        res.status(200).json({
          message: "Edit data success",
          data: result,
        });
      })
      .catch((err) => {
        console.log("error :", err);
        next();
      });
  }
};

const removeImage = (filePath) => {
  // posisi pwd di controller, tambah '../..' untuk naik 2 tingkat direktory ke root
  filePath = path.join(__dirname, "../", filePath);
  console.log(filePath);
  //perintah hapus file
  fs.unlink(filePath, (err) => console.log(err));
};
