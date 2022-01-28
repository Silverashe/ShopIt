const express = require('express');
const router = express.Router();


const { getProducts, newProduct, getSingleProduct, getSingleProductByName,updateProduct,deleteProduct} = require ('../controllers/productController')

//GET
router.route('/product/:id').get(getSingleProduct);
router.route('/product/name/:name').get(getSingleProductByName);
router.route('/products').get(getProducts);


//POST
router.route('/product/new').post(newProduct);


//PUT
router.route('admin/product/:id').put(updateProduct);

//DELETE
router.route('admin/product/:id').delete(deleteProduct);
module.exports = router;