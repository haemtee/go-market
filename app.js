const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

require("dotenv/config");

const app = express();
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

//middleware lokasi image dan nama image
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
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

//middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  "/public/images",
  express.static(path.join(__dirname, "public/images"))
);
// middleware simpan avatar
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "store_pic",
      maxCount: 1,
    },
  ])
); //nama json = avatar

// {base.api}/v1/user
app.use("/v1/user", userRoutes);
// {base.api}/v1/product
app.use("/v1/product", productRoutes);
// {base.api}/v1/cart
app.use("/v1/cart", cartRoutes);
// {base.api}/v1/order
app.use("/v1/order", orderRoutes);

// !handling error
app.use((err, req, res, next) => {
  const status = err.errorStatus || 500;
  const message = err.message;
  const data = err.data;

  res.status(status).json({ message: message, data: data });
});

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

//connect mongoose atlas, colection name = go-market
mongoose
  .connect(process.env.MONGODBURI, options)
  .then(
    app.listen(process.env.PORT, () => {
      console.log(
        "mongoDB Connected and Express running at ",
        process.env.PORT
      );
    })
  )
  .catch((err) => console.log(err));
