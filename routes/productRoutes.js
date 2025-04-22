const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const { validateProductInput, validate } = require('../middlewares/validateInput');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', validateProductInput, validate, createProduct);
router.get('/',getAllProducts);
router.get('/:id',getProductById);
router.put('/:id',validateProductInput, validate, updateProduct);
router.delete('/:id',deleteProduct);

module.exports = router;


