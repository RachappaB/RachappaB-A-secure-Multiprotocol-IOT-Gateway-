const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        trim:true,
        require:true
    },
    phone:{
        type:String,
        trim:true,
        require:true
    },
    email:{
        type:String, 
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true
    }
},
{timestamps:true})

module.exports = mongoose.model('Users',userSchema)