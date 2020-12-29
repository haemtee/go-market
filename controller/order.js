const { validationResult } = require("express-validator");

const Order = require("../models/order");
const product = require("../models/product");
const Product = require("../models/product");

exports.addOrderBySellerId = async (req, res, next) => {
  const errors = validationResult(req);
  //console.log("validation result =", errors);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();

    next(err);
  }
  const isSeller = req.isIdExist.roles === "seller";
  const isBuyer = req.userFromToken.roles === "buyer";
  if (isBuyer === false) {
    return res.status(403).json({
      message: "Error, hanya Pembeli yang bisa order",
    });
  } else if (isSeller === false) {
    return res.status(403).json({
      message: "Error, hanya Penjual yang menerima order",
    });
  } else {
    // ambil array products
    const products = req.body.products;

    const {
      buyer_name,
      buyer_phone,
      buyer_city,
      shipping_address,
      note,
    } = req.body;

    let productsOrder = [];
    let grand_total = 0;
    for (let i = 0; i < products.length; i++) {
      // cek product id dalam semua products array
      try {
        const result = await Product.findOne({ _id: products[i].product_id });
        // jika tidak ada maka
        if (result == null) {
          //console.log("result length = null");
          res.status(403).json({
            message: "Error salah satu product tidak ditemukan",
            data: { product_id: products[i].product_id },
          });
          // jika product ditemukan maka
        } else {
          if (
            result.stock < products[i].quantity ||
            result.available === false
          ) {
            return res.status(403).json({
              message:
                "Error Stok product tidak mencukupi, atau tidak tersedia",
              data: result,
            });
          } else if (
            JSON.stringify(result.seller_id) !=
            JSON.stringify(req.isIdExist._id)
          ) {
            console.log(result.seller_id);
            console.log(req.isIdExist._id);
            return res.status(403).json({
              message: "Products yang dikirim harus dari seller_id yang sama",
              data: {
                product_id: result._id,
                seller_id: result.seller_id,
                name: result.name,
                description: result.description,
                price: result.price,
              },
            });
          } else {
            let tempProduct = {
              product_id: result._id,
              seller_id: result.seller_id,
              product_name: result.name,
              product_price: result.price,
              quantity: products[i].quantity,
              total: products[i].quantity * result.price,
            };
            // tambahkan total ke grand total
            grand_total += tempProduct.total;
            // push ke array
            productsOrder.push(tempProduct);
          }
        }
      } catch {
        (err) => {
          console.log(err);
          throw err;
        };
      }
    }

    newOrder = {
      seller_id: req.isIdExist._id,
      buyer_id: req.userFromToken._id,
      products: productsOrder,
      grand_total: grand_total,
      buyer_name: buyer_name,
      buyer_phone: buyer_phone,
      shipping_address: shipping_address,
      buyer_city: buyer_city,
      note: note,
      payment: true,
      status: "processing",
    };
    // proses buat order
    try {
      const result = await Order.create(newOrder);
      res.status(201).json({
        message: "Sukses menerima order",
        data: result,
      });
    } catch {
      (err) => {
        console.log(err);
        next(err);
      };
    }
  }
};

exports.getByOrderId = async (req, res, next) => {
  const tokenId = JSON.stringify(req.userFromToken._id);
  const isAdmin = req.userFromToken.roles === "admin";

  try {
    const idOrder = req.params.id;
    if (idOrder.length != 24) {
      res.status(404).json({
        message: "Error, order id salah",
      });
    } else {
      const result = await Order.findById(idOrder);
      if (result === null) {
        res.status(404).json({
          message: "Error, order tidak ditemukan",
        });
      } else {
        if (tokenId != JSON.stringify(result.buyer_id)) {
          if (isAdmin === true) {
            res.status(200).json({
              message: "Sukses mengambil order by admin",
              data: result,
            });
          } else {
            res.status(403).json({
              message: "Error, hanya bisa membuka order milik sendiri",
            });
          }
        } else {
          res.status(200).json({
            message: "Sukses mengambil order sendiri",
            data: result,
          });
        }
      }
    }
  } catch {
    (err) => {
      console.log(err);
      next(err);
    };
  }
};

exports.getAllOrders = (req, res, next) => {
  const roles = req.userFromToken.roles;
  const idToken = req.userFromToken._id;
  if (roles === "admin") {
    Order.find()
      .sort({ createAt: -1 })
      .then((result) => {
        res.status(200).json({
          message: "Sukses mengambil semua order by admin",
          data: result,
        });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  } else if (roles === "buyer") {
    Order.find({ buyer_id: idToken })
      .then((result) => {
        res.status(200).json({
          message: "Sukses mengambil order (buyer)",
          data: result,
        });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  } else {
    Order.find({ seller_id: idToken })
      .then((result) => {
        res.status(200).json({
          message: "Sukses mengambil order (seller)",
          data: result,
        });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  }
};
exports.editStatusOrder = async (req, res, next) => {
  const roles = req.userFromToken.roles;
  const idToken = req.userFromToken._id;
  const idOrder = req.params.id;

  if (idOrder.length != 24) {
    res.status(404).json({
      message: "Error, order id salah",
    });
  } else {
    const result = await Order.findById(idOrder);
    let edit = { status: req.body.status };
    if (result === null) {
      res.status(404).json({
        message: "Error, order id tidak ditemukan",
      });
    } else {
      if (roles === "admin") {
        try {
          const hasil = Order.updateOne({ _id: idOrder }, { $set: edit });
          res.status(200).json({
            message: "Sukses edit status order by admin",
            data: hasil,
          });
        } catch {
          (err) => {
            console.log(err);
            next(err);
          };
        }
      } else if (roles === "buyer") {
        if (JSON.stringify(result.buyer_id) != JSON.stringify(idToken)) {
          res.status(404).json({
            message: "Error, order id bukan milik anda",
          });
        } else {
          if (edit.status === "received" || edit.status === "cancel") {
            try {
              const hasil = Order.updateOne({ _id: idOrder }, { $set: edit });
              res.status(200).json({
                message: "Sukses edit status order by buyer",
                data: hasil,
              });
            } catch {
              (err) => {
                console.log(err);
                next(err);
              };
            }
          } else {
            res.status(403).json({
              message: "Error, kesalahan input status",
            });
          }
        }
      } else {
        if (JSON.stringify(result.seller_id) != JSON.stringify(idToken)) {
          res.status(404).json({
            message: "Error, order id bukan milik anda",
          });
        } else {
          if (edit.status === "sending" || edit.status === "cancel") {
            try {
              const hasil = Order.updateOne({ _id: idOrder }, { $set: edit });
              res.status(200).json({
                message: "Sukses edit status order by seller",
                data: hasil,
              });
            } catch {
              (err) => {
                console.log(err);
                next(err);
              };
            }
          } else {
            res.status(403).json({
              message: "Error, kesalahan input status",
            });
          }
        }
      }
    }
  }
};
