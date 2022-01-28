const Product = require('../models/product');
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apifeatures');
const { query } = require('express');

//Create new Product => /api/v1/product/new
exports.newProduct = catchAsyncErrors (async ( req, res, next) =>
{

    
    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        product
    })
})

// Get All Products from the Database => /api/v1/products
exports.getProducts = catchAsyncErrors ( async (req, res, next) => {


    const resPerPage = 4;
    const productCount = await Product.countDocuments()
    const apiFeatures = new APIFeatures(Product.find(), req.query)
                        .search().filter().pagination(resPerPage);
    const product = await apiFeatures.query
    
    res.status(201).json({
        success: true,
        count: product.length,
        productCount,
        product
    })


})

// Get Single Product from the Database => /api/v1/product/id
exports.getSingleProduct = catchAsyncErrors ( async (req, res, next) => {

    const product = await Product.findById(req.params.id);
    
    if(!product)
    {
     
        return next( new ErrorHandler('Product Not Found', 404));
    }
    
        res.status(200).json({
            success: true,
            count: product.length,
            product
        })
      

})

// Get Single Product from the Database => /api/v1/product/name
exports.getSingleProductByName = catchAsyncErrors (async (req, res, next) => {

    const product = await Product.find({ name: req.params.name });
    console.log(product)
    if(!product || product.length == 0)
    {
        return next( new ErrorHandler('Product Not Found'));
    }

    res.status(200).json({
        success: true,
        count: product.length,
        product
    })


})

// Update Product  = > api/v1/product/:id
exports.updateProduct = catchAsyncErrors ( async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product)
    {
        return next( new ErrorHandler('Cannot Update Product. Product Not Found.'));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        count: product.length,
        product
    })


})

// Delete Product  = > api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors (async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product)
    {
        return next( new ErrorHandler('Cannot Delete Product. Product Not Found'));
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Product has been deleted'
     
    })


})

