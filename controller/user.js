const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const maxAge = 3 * 24 * 60 * 60; // 3 hari
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

exports.register = (req, res, next) => {
  const errors = validationResult(req);
  //console.log("error dari validation result =", errors);
  if (!errors.isEmpty()) {
    const err = new Error("Data Invalid");
    err.errorStatus = 400;
    err.data = errors.array();
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
        error.errorStatus = 400;
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
        if (req.body.avatar) {
          newUser = { ...newUser, avatar: req.body.avatar };
        }
        // double checking not required items
        if (req.body.store_name) {
          newUser = { ...newUser, store_name: req.body.store_name };
        }
        // double checking not required items
        if (req.body.store_pic) {
          newUser = { ...newUser, store_pic: req.body.store_pic };
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
              res.status(201).json({
                message: "Get data success",
                data: result,
              });
            }
            if (!result[0]) {
              const error = new Error("Tidak ada ID yang ditemukan");
              error.errorStatus = 400;
              throw error;
            }
          })
          .catch((err) => {
            next(err);
            //console.log(err);
          });
      } else {
        const error = new Error("Hanya admin yang diperbolehkan akses ini");
        error.errorStatus = 401;
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
        res.status(201).json({
          message: "Get data success",
          data: result,
        });
      }
      if (!result) {
        const error = new Error("Tidak ada ID yang ditemukan");
        error.errorStatus = 400;
        throw error;
      }
    })
    .catch((err) => {
      next(err);
      console.log(err);
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
    throw err;
  }

  const idToken = req.userFromToken._id;
  const isAdmin = req.userFromToken.roles === "admin";
  const idParams = req.params.id;
  // check apakah id param dan id json sesuai
  if (idParams != idToken) {
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
      User.updateOne({ _id: idParams }, { $set: edit })
        .then((result) => {
          res.status(201).json({
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
      error.errorStatus = 401;
      throw error;
    }
  } else if (idParams === idToken) {
    let edit = {};

    for (const obj in req.body) {
      if (obj) {
        edit[obj] = req.body[obj];
      }
    }
    // username dan roles di hapus, untuk mencegah penggantian username / roles
    if (edit.username) delete edit.username;
    if (edit.roles) delete edit.roles;

    User.updateOne({ _id: idParams }, { $set: edit })
      .then((result) => {
        res.status(201).json({
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
  const id = req.userFromToken._id;
  const isAdmin = req.userFromToken.roles === "admin";
  const idParams = req.params.id;
  // check apakah id param dan id json sesuai
  if (idParams != id) {
    // kalau admin bisa hapus
    if (isAdmin) {
      User.findOneAndDelete({ _id: idParams })
        .then((result) => {
          res.status(201).json({
            message: "Delete user success",
            data: result,
          });
        })
        .catch((err) => {
          console.log("error :", err);
          next();
        });
    } else {
      const error = new Error("Tidak punya akses untuk menghapus user");
      error.errorStatus = 401;
      throw error;
    }
  }
  // jika id cookie = id params ( hapus user sendiri )
  else if (idParams === id) {
    User.findOneAndDelete({ _id: idParams })
      .then((result) => {
        res.cookie("gomart", "", { maxAge: 1 });
        res.status(201).json({
          message: "Delete user success",
          data: result,
        });
      })
      .catch((err) => {
        console.log("error :", err);
        next();
      });
  }
};
