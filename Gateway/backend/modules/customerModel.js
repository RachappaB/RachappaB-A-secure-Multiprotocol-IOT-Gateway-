const mongoose = require('mongoose')
const customerSchema = mongoose.Schema({
    name:{
        type:String,
        trim:true,
       // require:true
    },
    phone:{
        type:String,
        trim:true,
       // require:true
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

module.exports = mongoose.model('Customer',customerSchema)