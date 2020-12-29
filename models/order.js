const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    buyer_id: { type: mongoose.Types.ObjectId, required: true, index: true },
    seller_id: { type: mongoose.Types.ObjectId, required: true, index: true },
    products: [
      {
        product_id: { type: mongoose.Types.ObjectId, required: true },
        product_name: { type: String, required: true },
        product_price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true },
        _id: false,
      },
    ],
    grand_total: { type: Number, required: true },
    buyer_name: { type: String, required: true },
    buyer_phone: { type: String, required: true },
    shipping_address: { type: String, required: true },
    buyer_city: { type: String, required: true },
    note: { type: String },
    payment: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["processing", "sending", "received", "cancel"],
      default: "processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
