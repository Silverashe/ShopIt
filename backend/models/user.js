const bcrypt = require('bcryptjs');
const mongoose  = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')



const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Your name cannot exceed 30 character']
    },
    email:{
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Your password must be at least 6 characters'],
        select: false

    },
    avatar:{

        public_id: {
            type:String,
            required: true,
        },
        url:{
            type:String,
            required: true
        }
        
    }, 
    role: {
        type: String,
        default: 'user'
    },
    createAt: {
        type: Date,
        default: Date.now

    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

   
})


// Encrypting Password Before Saving user
userSchema.pre('save', async function(next){
    if(!this.isModified('password'))
    {
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)

})

// Return JWT token 

userSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

userSchema.methods.comparePassword = async function(enteredPassword){

   return await bcrypt.compare(enteredPassword, this.password);

   
}


// Generate Password reset token
userSchema.methods.getResetPassword = function ()
{
    //Generate TokenExpiredError
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set Token expite time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken;
}
module.exports = mongoose.model('User', userSchema)