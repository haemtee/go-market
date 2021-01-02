const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    // seller_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    seller_id: { type: mongoose.Types.ObjectId, required: true },
    name: { type: String, required: true, index: true },
    image: { type: String, require: true },
    description: { type: String, required: true },
    price: {
      type: Number,
      min: [0, "Harga tidak boleh negatif"],
      required: true,
    },
    stock: {
      type: Number,
      min: [0, "Stok tidak boleh negatif"],
      required: true,
    },
    available: { type: Boolean, default: true },
    promoted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
