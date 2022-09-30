const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


// name, email, password, photo, passwordConfirm



const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required : [true, 'Please tell us your name.'],
        trim : true,
        maxlength : [40, 'The username must have less or equal then 40 characters.'],
        minlength : [3, 'The username must have less or equal then 3 characters.'],
    },

    email : {
        type : String,
        required : [true, 'Please tell us your email.'],
        unique : true,
        lowercase: true,
        validate: [validator.isEmail, 'Please prove a valid email address.']
    },
    photo : {
        type: String,
    },
    role : {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default : 'user',
    },
    password : {
        type : String,
        required : [true, 'Please prove a valid password.'],
        minlength : [8, 'The password must have less or equal then 6 characters.'],
        maxlength : [30, 'The password must have less or equal then 30 characters.'],
        select: false,
    },
    passwordConfirm : {
        type : String,
        required : [true, 'Please confirm your password'],
        validate : {
            // this only works on CREATE and SAVE
            validator: function(el) {
                return el === this.password;
            },
            message : 'Passwords are not the same.'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires: Date,
})

// database kaydederken password hashleme
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    // hash the password cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // delete password field from database
    this.passwordConfirm = undefined;
    next()
});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
/*         console.log(changedTimestamp, JWTTimestamp)  */

        return JWTTimestamp < changedTimestamp; // 100 < 200
    }

    // False means not changes
    return false;
}


userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User