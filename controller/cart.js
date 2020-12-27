const { validationResult } = require("express-validator");

const Cart = require("../models/cart");
const Product = require("../models/product");

const getProduct = async (id) => {
  try {
    const result = await Product.findOne({ _id: id });
    if (result === null) {
      res.status(404).json({
        message: "Error, produk tidak ditemukan",
      });
    } else {
      if (result.available === false || result.stock === 0) {
        res.status(404).json({
          message: "Error, produk tidak tersedia",
        });
      } else {
        return result;
      }
    }
  } catch {
    (err) => console.log(err);
  }
};

exports.getCart = (req, res, next) => {
  const isBuyer = req.userFromToken.roles == "buyer";
  if (!isBuyer) {
    if (req.userFromToken.roles === "admin") {
      Cart.findOne({ buyer_id: req.params.id })
        .then((result) => {
          res
            .status(200)
            .json({ message: "Sukses mengambil cart by admin", data: result });
        })
        .catch((err) => {
          console.log(err);
          next();
        });
    } else {
      res.status(403).json({
        message: "Error, Hanya buyer yang bisa menambah keranjang",
      });
    }
  }
  Cart.findOne({ buyer_id: req.params.id })
    .then((result) => {
      res.status(200).json({ message: "Sukses mengambil cart", data: result });
    })
    .catch((err) => {
      console.log(err);
      next();
    });
};

exports.addProductToCart = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();
    next(err);
    //throw err;
  }

  const idToken = req.userFromToken._id;
  const idUser = req.isIdExist._id;
  const isBuyer = req.userFromToken.roles == "buyer";

  const tokenId = JSON.stringify(idToken);
  const userId = JSON.stringify(idUser);

  if (tokenId != userId) {
    res.status(403).json({
      message: "Error, Hanya bisa menambah keranjang sendiri",
    });
  } else if (!isBuyer) {
    res.status(403).json({
      message: "Error, Hanya buyer yang bisa menambah keranjang",
    });
  } else {
    const { product_id, quantity } = req.body;

    const product = await Product.findOne({ _id: product_id });
    if (product === null) {
      res.status(404).json({
        message: "Error, produk tidak ditemukan",
      });
    } else {
      if (product.available === false || product.stock === 0) {
        res.status(404).json({
          message: "Error, produk tidak tersedia",
        });
      } else {
        const seller_id = product.seller_id;
        const stock = product.stock;
        const product_name = product.name;
        const product_price = product.price;

        if (quantity > stock) {
          res.status(401).json({
            message: "Error, stock tidak mencukupi",
          });
        } else {
          let result = await Cart.findOne({ buyer_id: idUser });
          if (result) {
            //cart exists for user
            let itemIndex = result.products.findIndex(
              (p) => p.product_id == product_id
            );
            if (itemIndex > -1) {
              //product exists in the cart, update the quantity and total price
              let productItem = result.products[itemIndex];
              productItem.quantity = quantity;
              productItem.total = quantity * product_price;

              result.products[itemIndex] = productItem;
            } else {
              //product does not exists in cart, add new item
              let total = quantity * product_price;
              result.products.push({
                product_id,
                seller_id,
                product_name,
                product_price,
                quantity,
                total,
              });
            }
            if (quantity === 0) {
              result.products.splice(itemIndex, 1);
            }

            data = await result.save();
            return res.status(200).json({
              message: "Sukses merubah keranjang",
              data: data,
            });
          } else {
            //no cart for user, create new cart
            total = quantity * product_price;
            const objCart = {
              buyer_id: idToken,
              products: [
                {
                  product_id: product_id,
                  seller_id: seller_id,
                  product_name: product_name,
                  product_price: product_price,
                  quantity: quantity,
                  total: total,
                },
              ],
            };
            const newCart = await Cart.create(objCart);

            return res.status(201).json({
              message: "Sukses menambah keranjang",
              data: newCart,
            });
          }
        }
      }
    }
  }
};

exports.deleteAllCart = (req, res, next) => {
  const idToken = req.userFromToken._id;
  const idUser = req.isIdExist._id;
  const isBuyer = req.userFromToken.roles == "buyer";

  const tokenId = JSON.stringify(idToken);
  const userId = JSON.stringify(idUser);

  if (tokenId != userId) {
    res.status(403).json({
      message: "Error, Hanya bisa menghapus keranjang sendiri",
    });
  } else if (!isBuyer) {
    res.status(403).json({
      message: "Error, Hanya buyer yang bisa menghapus keranjang",
    });
  } else {
    Cart.findOneAndDelete({ buyer_id: idUser })
      .then((result) => {
        res.status(200).json({
          message: "Sukses, Keranjang dihapus",
          data: result,
        });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  }
};
