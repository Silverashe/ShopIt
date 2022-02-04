const Order = require('../models/orders')
const Product = require('../models/product')
const User = require('../models/user')


const errorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')


//Create new Order => api/v1/order/new

exports.newOrder = catchAsyncErrors( async(req, res, next) => {
    const {
        orderItems, 
        shippingInfo,
        itemPrice,
        taxPrice,
        shippingPrice, 
        totalPrice, 
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems, 
        shippingInfo,
        itemPrice,
        taxPrice,
        shippingPrice, 
        totalPrice, 
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id

    })

    res.status(200).json({
        success: true,
        order
    })


})

//Create new Order => api/v1/me/order/:id
exports.getSingleOrder = catchAsyncErrors( async(req, res, next) => {
    
    const order = await Order.findById(req.params.id).populate('user', 'name email')


    if(!order){
        return next(new errorHandler('No order found with this ID', 404))
    }

    res.status(200).json({
        success: true,
        order
    })


})


//Retrieve all the current user orders
exports.myOrders = catchAsyncErrors( async(req, res, next) => {
    const orders = await Order.find({user: req.user.id})
    let totalamount = 0;

    orders.forEach( order => {
        total += order.totalPrice;
    })

    if(!orders){
        return next(new errorHandler('You have no order under your account', 404))
    }
    
    res.status(200).json({
        success: true,
        orders,
        totalamount
    })


})

//Admin retrieving all the all orders => api/v1/admin/orders

exports.allOrders = catchAsyncErrors( async(req, res, next) => {
    const orders = await Order.find()
    let totalamount = 0;

    orders.forEach( order => {
        totalamount += order.totalPrice;
    })

    if(!orders){
        return next(new errorHandler('You have no order under your account', 404))
    }
    
    res.status(200).json({
        success: true,
        totalamount,
        orders
    })


})

// Update/Process order => api/v1/admin/order/:id

exports.processOrder = catchAsyncErrors( async(req, res, next) => {
    const order = await Order.findById(req.params.id)
    
    if(!order){
        return next(new errorHandler(`Order with this Id does not exist` , 404))
    }

    if(order.orderStatus === 'delivered'){

        return next(new errorHandler('Order has been already been delivered', 400))
    }

  
    order.orderItems.forEach( async item => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status
    order.deliverAt = Date.now()

    await order.save()
    
    res.status(200).json({
        success: true,
        order
    }) 


})


async function updateStock(id, quantity){

       const product = await Product.findById(id);

    product.stock = product.stock - quantity

    await product.save()
}



exports.deleteOrder = catchAsyncErrors( async(req, res, next) => {
    
    
    let order = await Order.findById(req.params.id);

    if(!order)
    {
        return next( new errorHandler('Cannot Delete Order. Product Not Found'),404);
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order has been deleted'
     
    })


})