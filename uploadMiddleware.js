//const express = require("express");
const multer = require("multer");

//const app = express();

//middleware lokasi image dan nama image
const fileUserStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/user");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});
const fileProductStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/product");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// middleware user avatar and store
exports.uploadUser = multer({
  storage: fileUserStorage,
  fileFilter: fileFilter,
});

//middleware product image
exports.uploadProduct = multer({
  storage: fileProductStorage,
  fileFilter: fileFilter,
});
