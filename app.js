const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
require("dotenv/config");

const app = express();

//middleware
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Hello");
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
