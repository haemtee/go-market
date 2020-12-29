const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

require("dotenv/config");

const app = express();
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

//middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

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
