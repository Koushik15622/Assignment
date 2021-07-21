require('dotenv').config();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

var cs = process.env.MCS || '';
mongoose.connect(cs,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
var db = mongoose.connection;
db.on('connected', function() {
console.log("Users Successfully connected to MongoDB!");
});

db.on('error',function(err){
    console.log('Users connect error:'+err);
})
db.on('disconnected',function(){
    console.log('Users disconnected');
})


const userSchema = mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required: true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    },
    img:
    {
        data: Buffer,
        contentType: String
    }
})

userSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function(plaintext, callback) {
    return callback(null, bcrypt.compareSync(plaintext, this.password));
};

const userModel = mongoose.model('user',userSchema)
module.exports = userModel
