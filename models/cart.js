const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    buyer_id: { type: mongoose.Types.ObjectId, required: true, unique: true },
    products: [
      {
        product_id: { type: mongoose.Types.ObjectId, required: true },
        seller_id: { type: mongoose.Types.ObjectId, required: true },
        product_name: { type: String, required: true },
        product_price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true },
        _id: false,
      },
    ],
    // grand_total : { type : Number, required: true},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
