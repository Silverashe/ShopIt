const User = require('../models/user');

const ErrorHandler = require('../utils/errorhandler');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { send } = require('process');
//Register User => /api/v1/registerUser



exports.registerUser = catchAsyncErrors( async(req, res, next) => {

    const {name, email, password} = req.body;

    const user = await User.create({
        name: name,
        email: email, 
        password: password,
        avatar:{
        public_id: 'Sample',
        url:'Sample'
    }
});


    // const token = user.getJwtToken();

    // res.status(201).json({
    //     success: true,
    //     token    
    // });

    sendToken(user, 200, res)
})


exports.loginUser = catchAsyncErrors( async(req, res, next) => {

    const {email, password} = req.body;


    // Checks if email and password is entered by user
    if(!email || !password) {
        return next(new ErrorHandler('Please enter email or password', 400))
    }

    //Encrypt Password
    //const ePassword = password = await bcrypt.hash(this.password, 10)
    //Finding Users
    const user = await User.findOne({email}).select('+password');

    if(!user){

        return next(new ErrorHandler('Invalid Email or Password', 401))
    }

    // Check if passord is correct or not

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){

        return next(new ErrorHandler('Invalid Email or Password', 401))
    }

    sendToken(user, 200, res)
})

//Reset Password => ap
exports.resetPassword = catchAsyncErrors ( async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt:Date.now()}

    })

    if(!user){

        return next(new ErrorHandler('Reset Password token is invalid or has been expired', 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match', 400))
    }

    //Set up the new password
    user.password = req.body.password

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;


    await user.save()

    sendToken(user, 200, res)
})

//Forgot Password => /api/v1/passowrd/forgotPassword
exports.forgotPassword = catchAsyncErrors ( async (req, res, next) => {

    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler('user not found with this email', 404))
    }

    // Get reset token
    const resetToken = user.getResetPassword();

    await user.save({ validateBeforeSave: false })

    //Create Password URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is a follow: \n\n${resetUrl}\n\nIf you have not requested is email, then ignore it`

    try{

        await sendEmail({
            email: user.email, 
            subject: 'ShopIT Password Recovery', 
            message

        })


        res.status(200).json({

            success: true,
            message: `Email sent to: ${user.email}`

        })
    }
    catch(error)
    {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;


        await user.save({validateBeforeSave: false})

        return next(new ErrorHandler(error.message, 500))
    }
})


//Get Current Logged in User details => /api/v1/members

exports.getUserProfile = catchAsyncErrors( async(req,res,next) =>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })

})


// Update . change password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors( async(req,res,next) =>{

    const user = await User.findById(req.user.id).select("+password");

    if(!user)
    {
        return next(new ErrorHandler('User must be signed in to use this features', 500))
    }     
    
    const isMatched = await user.comparePassword(req.body.oldPassword)

    if(!isMatched){
        return next(new ErrorHandler('Old Password is not incorrect',400))
    }

    user.password = req.body.password;

    await user.save();
  
    sendToken(user,200, res)

})

// Update user profile => /api/v1/me/update

exports.updateProfile = catchAsyncErrors( async(req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }


    //Update avatar" TODO
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false

    })

    res.status(200).json({
        success: true,
        user
    })
})

// Logs the current user out => /api/v1/logout
exports.logout = catchAsyncErrors( async(req, res, next) => {

    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })



})


//Admin routes

//Get all users => /api/v1/admin/users

exports.allUsers = catchAsyncErrors( async(req, res, next) => {

    const users = await User.find();

    res.status(200).json({
        success: true,
        users

    })

})

//Get all users => /api/v1/admin/user/:id
exports.getUser = catchAsyncErrors( async( req, res, next) => {

    const users = await User.findById(req.params.id);

    if(!users){
        return next(new ErrorHandler('User does not exist. Please Try Again'), 404)
    }

    res.status(201).json({
        success: true,
        users

    })

})

//Get updateUserInfo => /api/v1/admin/update/user/:id
exports.updateUserInfo = catchAsyncErrors( async( req, res, next) => {

    let user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler('User does not exist. Please Try Again'), 404)
    }
    

     console.log(req.body.name)
     const newUserData = {
         name: req.body.name,
         email: req.body.email,
         role: req.body.role
        }

    user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })


    res.status(200).json({
        success: true,
        user
    })

    

})

//Get updateUserInfo => /api/v1/admin/delete/user/:id
exports.deleteUser= catchAsyncErrors( async( req, res, next) => {

    const users = await User.findById(req.params.id);

    if(!users){
        return next(new ErrorHandler('User does not exist. Please Try Again'), 404)
    }
    
   await users.remove()

   res.status(200).json({
    success: true,
    users
})
    

    

})



