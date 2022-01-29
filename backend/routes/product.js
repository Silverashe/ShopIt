const express = require('express');
const router = express.Router();


const { getProducts, newProduct, getSingleProduct, getSingleProductByName,updateProduct,deleteProduct} = require ('../controllers/productController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
//GET
router.route('/product/:id').get(getSingleProduct);
router.route('/product/name/:name').get(getSingleProductByName);
router.route('/products').get( isAuthenticatedUser, getProducts);


//POST
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'),newProduct);


//PUT
router.route('admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct);

//DELETE
router.route('admin/product/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;