const User = require('../models/user');

const ErrorHandler = require('../utils/errorhandler');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');

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