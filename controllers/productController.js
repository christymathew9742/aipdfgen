const productService = require('../services/productService');
const { errorResponse } = require('../utils/errorResponse');

// Create a new product associated with a user
// const createProduct = async (req, res, next) => {
//     try {
//         if (!req.user || !req.user.userId) {
//             return next(errorResponse('User not authenticated', 401));
//         }
//         const productData = req.body;
//         productData.user = req.user.userId;
//         const newProduct = await productService.createProduct(productData,);
//         res.status(201).json({ success: true, data: newProduct });
//     } catch (error) {
//         next(error);
//     }
// };

const createProduct = async (req, res, next) => {
    try {
        const productData = req.body;
        const newProduct = await productService.createProduct(productData);

        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        next(error);
    }
};

// Get all products for the authenticated user
const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts(req.user.userId);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};

// Get a specific product by ID for the authenticated user
const getProductById = async (req, res, next) => {
    try {
            const product = await productService.getProductById(req.params.id, req.user.userId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// Update a product if it belongs to the authenticated user
const updateProduct = async (req, res, next) => {
    try {
        const updatedProduct = await productService.updateProduct(req.params.id, req.body, req.user.userId);
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        }
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

// Delete a product if it belongs to the authenticated user
const deleteProduct = async (req, res, next) => {
    try {
        const message = await productService.deleteProduct(req.params.id, req.user.userId);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        }
        res.status(200).json({ success: true, message });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};


