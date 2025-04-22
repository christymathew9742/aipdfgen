const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
}, { 
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
