const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  seller_id: { type: ObjectId, required: true },
  name: { type: String, required: true, index: true },
  image: { type: String },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, min: [0, "Stok tidak boleh negatif"], required: true },
  available: { type: Boolean, required: checkStock },
  promoted: { type: Boolean, default: false },
});

function checkStock() {
  return this.stock;
}

module.exports = mongoose.model("Product", productSchema);
