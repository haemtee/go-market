const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Product = require("../models/product");

const maxAge = 3 * 24 * 60 * 60; // 3 hari
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

exports.register = (req, res, next) => {
  const errors = validationResult(req);
  //console.log(req.files);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();
    removeUserImg(req);
    throw err;
  }
  // destruktur req body
  const { username, password, roles, name, phone, address, city } = req.body;

  // check apakah username sudah terdaftar ?
  User.findOne({ username: username })
    .select("-password")
    .then((result) => {
      if (result) {
        const error = new Error("Username sudah terdaftar");
        error.errorStatus = 403;
        removeUserImg(req);
        throw error;
      }
      // jika email tidak terdaftar, maka simpan user
      if (!result) {
        let newUser = {
          username: username,
          password: password,
          roles: roles,
          name: name,
          phone: phone,
          address: address,
          city: city,
        };
        // double checking not required items
        if (req.files?.avatar) {
          newUser = { ...newUser, avatar: "/" + req.files.avatar[0].path };
        } else {
          newUser = { ...newUser, avatar: "/public/images/default-avatar.png" };
        }

        if (roles === "seller") {
          // double checking not required items
          if (req.body.store_name) {
            newUser = { ...newUser, store_name: req.body.store_name };
          } else {
            newUser = { ...newUser, store_name: "Toko " + name };
          }
          // double checking not required items
          if (req.files?.store_pic) {
            newUser = {
              ...newUser,
              store_pic: "/" + req.files.store_pic[0].path,
            };
          } else {
            newUser = {
              ...newUser,
              store_pic: "/public/images/default-store_pic.png",
            };
          }
        }
        const Posting = new User(newUser);
        Posting.save()
          .then((result) => {
            // membuat token jwt berdasarkan _id user yang baru di create
            const token = createToken(result._id);
            // mengirim cookie name gomart
            res.cookie("gomart", token, {
              httpOnly: true,
              maxAge: maxAge * 1000,
            });
            res.status(201).json({
              message: "Register Success",
              data: result,
            });
          })
          .catch((err) => {
            next(err);
            console.log("error: " + err);
          });
      }
    })
    .catch((err) => {
      next(err);
      console.log(err);
    });
};

exports.getAllUser = (req, res, next) => {
  //console.log("console log get all user" );
  const id = req.userFromToken._id;
  User.findOne({ _id: id })
    .then((result) => {
      //console.log("result =", result);
      if (result.roles === "admin") {
        User.find()
          .select("-password")
          //.limit(10)
          // sort by newest
          .sort("-createdAt")
          .then((result) => {
            if (result[0]) {
              res.status(200).json({
                message: "Get data success",
                data: result,
              });
            }
            if (!result[0]) {
              const error = new Error("Tidak ada ID yang ditemukan");
              error.errorStatus = 404;
              throw error;
            }
          })
          .catch((err) => {
            next(err);
            //console.log(err);
          });
      } else {
        const error = new Error("Hanya admin yang diperbolehkan akses ini");
        error.errorStatus = 403;
        throw error;
      }
    })
    .catch((err) => {
      next(err);
      console.log("catch error =", err);
    });
};

exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    //.limit(10)
    // sort by newest
    .sort("-createdAt")
    .then((result) => {
      if (result) {
        res.status(200).json({
          message: "Get data success",
          data: result,
        });
      }
      if (!result) {
        const error = new Error("Tidak ada ID yang ditemukan");
        error.errorStatus = 404;
        throw error;
      }
    })
    .catch((err) => {
      next(err);
      console.log(err);
    });
};

exports.getOwnId = (req, res, next) => {
  // get from token
  const result = req.userFromToken;
  // hapus password field
  delete result.password;

  res.status(200).json({
    message: "Sukses mengambil id sendiri",
    data: result,
  });
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  //console.log(errors);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }
  const { username, password } = req.body;

  User.login(username, password)
    .then((user) => {
      const token = createToken(user._id);
      res.cookie("gomart", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id });
    })
    .catch((error) => {
      next(error);
      console.log(error);
    });
};

exports.logout = (req, res, next) => {
  res.cookie("gomart", "", { maxAge: 1 });
  res.status(200).json({ message: "You has logged out" });
};

exports.editUser = (req, res, next) => {
  // validasi body
  const errors = validationResult(req);
  //console.log(errors);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();
    removeUserImg(req);
    throw err;
  }

  const idToken = req.userFromToken._id;
  const isAdmin = req.userFromToken.roles === "admin";
  const idUser = req.params.id;
  const dataId = req.isIdExist;
  // check apakah id param dan id json sesuai

  const tokenId = JSON.stringify(idToken);
  const userId = JSON.stringify(idUser);

  console.log(req.files);
  if (userId != tokenId) {
    if (isAdmin) {
      let edit = {};

      for (const obj in req.body) {
        if (obj) {
          edit[obj] = req.body[obj];
        }
      }

      // admin bisa mengganti roles
      if (edit.username) delete edit.username;
      // if (edit.roles) delete edit.roles;

      if (req.files?.avatar) {
        edit = { ...edit, avatar: "/" + req.files.avatar[0].path };
        // hapus file avatar sebelumnya
        if (dataId.avatar != "/public/images/default-avatar.png") {
          removeImage(dataId.avatar);
        }
      }

      if (req.isIdExist.roles === "seller") {
        // double checking upload file
        if (req.body.store_name) {
          edit = { ...edit, store_name: req.body.store_name };
          if (dataId.store_pic != "/public/images/default-store_pic.png") {
            removeImage(dataId.store_pic);
          }
        }
        // double checking upload file
        if (req.files?.store_pic) {
          edit = {
            ...edit,
            store_pic: "/" + req.files.store_pic[0].path,
          };
        }
      } else {
        delete edit.store_name;
        delete edit.store_pic;
      }

      User.updateOne({ _id: idUser }, { $set: edit })
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
    } else {
      const error = new Error("Hanya bisa mengedit user sendiri");
      error.errorStatus = 403;
      removeUserImg(req);
      throw error;
    }
  } else if (userId === tokenId) {
    let edit = {};

    for (const obj in req.body) {
      if (obj) {
        edit[obj] = req.body[obj];
      }
    }
    // username dan roles di hapus, untuk mencegah penggantian username / roles
    if (edit.username) delete edit.username;
    if (edit.roles) delete edit.roles;
    if (req.files?.avatar) {
      edit = { ...edit, avatar: "/" + req.files.avatar[0].path };
      if (dataId.avatar != "/public/images/default-avatar.png") {
        removeImage(dataId.avatar);
      }
    }

    if (req.isIdExist.roles === "seller") {
      // double checking upload file
      if (req.body.store_name) {
        edit = { ...edit, store_name: req.body.store_name };
      }
      // double checking upload file
      if (req.files?.store_pic) {
        edit = {
          ...edit,
          store_pic: "/" + req.files.store_pic[0].path,
        };
        if (dataId.store_pic != "/public/images/default-store_pic.png") {
          removeImage(dataId.store_pic);
        }
      }
    } else {
      delete edit.store_name;
      delete edit.store_pic;
    }

    User.updateOne({ _id: idUser }, { $set: edit })
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

exports.deleteUser = (req, res, next) => {
  const idToken = req.userFromToken._id;
  const isAdmin = req.userFromToken.roles === "admin";

  const idUser = req.params.id;
  const isSeller = req.isIdExist.roles === "seller";
  // check apakah id param dan id json sesuai
  const tokenId = JSON.stringify(idToken);
  const userId = JSON.stringify(idUser);
  const dataId = req.isIdExist;

  if (userId != tokenId) {
    // kalau admin bisa hapus
    if (isAdmin) {
      User.findOneAndDelete({ _id: idUser })
        .then((result) => {
          res.status(200).json({
            message: "Sukses menghapus user oleh admin",
            data: result,
          });
          if (dataId.avatar != "/public/images/default-avatar.png") {
            removeImage(dataId.avatar);
          }
          // clean up product yang dia jual jika dia buyer
          if (isSeller) {
            if (dataId.store_pic != "/public/images/default-store_pic.png") {
              removeImage(dataId.store_pic);
            }
            Product.deleteMany({ seller_id: idUser })
              .then((result) => console.log(result))
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => {
          console.log("error :", err);
          next();
        });
    } else {
      const error = new Error("Tidak punya akses untuk menghapus user");
      error.errorStatus = 403;
      throw error;
    }
  }
  // jika id cookie = id params ( hapus user sendiri )
  else if (userId == tokenId) {
    console.log("me", dataId);
    // hapus avatar nya
    if (dataId.avatar != "/public/images/default-avatar.png") {
      removeImage(dataId.avatar);
    }

    // clean up product yang dia jual jika dia buyer
    if (isSeller) {
      if (dataId.store_pic != "/public/images/default-store_pic.png") {
        removeImage(dataId.store_pic);
      }
      Product.deleteMany({ seller_id: idUser })
        .then((result) => console.log(result))
        .catch((err) => console.log(err));
    }
    User.findOneAndDelete({ _id: idUser })
      .then((result) => {
        res.cookie("gomart", "", { maxAge: 1 });
        res.status(200).json({
          message: "Sukses menghapus user sendiri",
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

const removeUserImg = (req) => {
  if (req.files.avatar) removeImage(req.files?.avatar[0]?.path);
  if (req.files.store_pic) removeImage(req.files?.store_pic[0]?.path);
};
