const User = require("../models/user")
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");

//check if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors( async (req, res, next) => {

     const { token } = req.cookies

    

    if(!token) {
        return next( new ErrorHandler('Login First to Access Resource', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    
    req.user = await User.findById(decoded.id);
    
    if(!req.user) {
        return next( new ErrorHandler('This user does not exist in the Database. Please sign in with the proper credentials', 401))
    }

    next()
})

//Handling User Roles
exports.authorizeRoles =  (...roles) => {

    
    return (req, res, next) => {
        
        if(!roles.includes(req.user.role)){

            return next(new ErrorHandler(`Roles ${req.user.role} is not allowed to acces this resource`, 403))
            
        }
      
        next();
    }

   

}