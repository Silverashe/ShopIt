const Product = require('../models/product');
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apifeatures');
const { query } = require('express');

//Create new Product => /api/v1/product/new
exports.newProduct = catchAsyncErrors (async ( req, res, next) =>
{
    

    req.body.user = req.user.id;
    
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


//Create new review => /pai/v1/reviews
exports.createProductReview = catchAsyncErrors (async (req, res, next) => {

    const { rating, comment, productId } = req.body

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find(
       
        r => r.user.toString() === req.user._id.toString()
    )

    if(isReviewed) {
        product.reviews.forEach( review => {
            if(review.user.toString() === req.user._id.toString()){
                review.comment = comment;
                review.rating = rating
            }
        });
    }
    else
    {
        product.reviews.push(review);
        product.numOfReview = (product.reviews.length + 1)
    }

    product.ratings = Number(product.reviews.reduce(( acc, item) => item.rating + acc, 0) / product.reviews.length)
    await product.save()

    res.status(200).json({
        success: true,
        message: 'Review has been added'
     
    })
})

//Create new review => /pai/v1/reviews/:id
exports.getProductReviews = catchAsyncErrors (async (req, res, next) => {

    
    const product = await Product.findById(req.query.id)

   

    await product.save()

    res.status(200).json({
        success: true,
        reviews: product.reviews
     
    })
})

//Delete review => /pai/v1/review/delete
exports.deleteReview = catchAsyncErrors (async (req, res, next) => {

    
    const product = await Product.findById(req.query.productId)

    const  reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReview = reviews.length;

    const ratings = product.ratings = Number(product.reviews.reduce(( acc, item) => item.rating + acc, 0) / reviews.length)
    
    const updatedProduct = await Product.findByIdAndUpdate(req.query.productId, {

        reviews,
        ratings, 
        numOfReview
    },
    {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        updatedProduct
        
     
    })
})


