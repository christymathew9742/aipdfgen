const Product = require('../models/Product');
const { errorResponse } = require('../utils/errorResponse');

// Creating a new product
const createProduct = async (productData) => {
    try {
        const newProduct = new Product(productData);
        return await newProduct.save();
    } catch (error) {
        throw new Error('Error creating product');
    }
};

// Getting all products for a specific user
const getAllProducts = async (userId) => {
    try {
        return await Product.find({ user: userId });
    } catch (error) {
        throw new Error(`Error fetching products: ${error.message}`);
    }
};

// Getting a single product by ID for a specific user
const getProductById = async (id, userId) => {
    
    try {
        const product = await Product.findOne({ _id:id, user: userId });
        if (!product) {
            throw errorResponse('Product not found', 404);
        }
        return product;
    } catch (error) {
        throw new Error('Error fetching product');
    }
};

// Updating a product for a specific user
const updateProduct = async (id, productData, userId) => {
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, user: userId },
            productData,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updatedProduct) {
            throw errorResponse('Product not found', 404);
        }
        return updatedProduct;
    } catch (error) {
        throw new Error('Error updating product');
    }
};

// Deleting a product for a specific user
const deleteProduct = async (id, userId) => {
    try {
        const product = await Product.findOneAndDelete({ _id: id, user: userId });
        if (!product) {
            throw errorResponse('Product not found', 404);
        }
        return 'Product deleted successfully';
    } catch (error) {
        throw new Error('Error deleting product');
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};

