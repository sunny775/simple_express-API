var mongoose = require("mongoose");

var productsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  featured: String,
  special: String,
  bestSeller: String,
  created: {
    type: Date,
    default: Date.now
  }
});

var Products = mongoose.model("products", productsSchema);

module.exports = Products;
