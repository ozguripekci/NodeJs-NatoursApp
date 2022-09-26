const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
// name, email, password, photo, passwordConfirm



const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required : [true, 'Please tell us your name.'],
        trim : true,
        maxlength : [40, 'The username must have less or equal then 40 characters.'],
        minlength : [3, 'The username must have less or equal then 10 characters.'],
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
    password : {
        type : String,
        required : [true, 'Please prove a valid password.'],
        minlength : [8, 'The password must have less or equal then 6 characters.'],
        maxlength : [30, 'The password must have less or equal then 30 characters.'],
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
    }
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



const User = mongoose.model('User', userSchema);
module.exports = User