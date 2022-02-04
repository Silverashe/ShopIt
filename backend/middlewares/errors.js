const ErrorHandler  = require('../utils/errorhandler');



module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV === 'DEVELOPMENT'){

        res.status(err.statusCode).json({
            success: false,
            error: `${err.message}`+ ` ` +`${err.statusCode}`,
            stack: err.stack
        })
        
    }

    if(process.env.NODE_ENV === 'PRODUCTION'){


        // Wrong mongoose object ID Error
        if(err.name === 'CastError'){
            const message = `Resource not found. Invalid: ${err.path}`;
            err = new ErrorHandler(message, 400)
        }

        //Handling Mongoose validation error
        if(err.name === 'ValidationError')
        {
            const message = Object.values(err.errors).map( value => value.message);
            err = new ErrorHandler(message, 400)
        }


        //Handling mongoose duplicate keys errors
        if(err.code === 11000)
        {
            const message = `Email ${Object.keys(err.keyValue)} has already been used`;
            err = new ErrorHandler(message, 400)
        }


         //Handling wrong JWT Error
         if(err.name === 'JsonWebTokenError')
         {
             const message = 'JSON Web Token is invalid, Try Again!!!';
             err = new ErrorHandler(message, 400)
         }

           //Handling expired JWT error
           if(err.name === 'TokenExpiredError')
           {
               const message = 'JSON Web Token is Expire, Try Again!!!';
               err = new ErrorHandler(message, 400)
           }
  

        res.status(err.statusCode).json({
            success: false,
            errorNumber: `${err.statusCode}`,
            errorMessage: `${err.message}` || 'Internal Server Error'
        })
        
    }
  
}