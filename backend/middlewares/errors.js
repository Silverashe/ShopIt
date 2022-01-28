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


        res.status(err.statusCode).json({
            success: false,
            errorNumber: `${err.statusCode}`,
            errorMessage: `${err.message}` || 'Internal Server Error'
        })
        
    }
  
}