const express = require('express');
const router = express.Router();


const { 
    getProducts, 
    newProduct, 
    getSingleProduct, 
    getSingleProductByName,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteReview } = require ('../controllers/productController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
//GET
router.route('/product/:id').get(getSingleProduct);
router.route('/product/name/:name').get(getSingleProductByName);
router.route('/products').get(getProducts);
router.route('/reviews').get( isAuthenticatedUser, getProductReviews);



//POST
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'),newProduct);


//PUT
router.route('admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.route('/review').put(isAuthenticatedUser, createProductReview);


//DELETE
router.route('admin/product/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.route('/reviews').delete( isAuthenticatedUser, deleteReview );





module.exports = router;