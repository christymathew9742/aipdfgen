const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const { validateProductInput, validate } = require('../middlewares/validateInput');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/',authMiddleware, validateProductInput, validate, createProduct);
router.get('/', authMiddleware,getAllProducts);
router.get('/:id', authMiddleware,getProductById);
router.put('/:id', authMiddleware,validateProductInput, validate, updateProduct);
router.delete('/:id', authMiddleware,deleteProduct);

module.exports = router;


