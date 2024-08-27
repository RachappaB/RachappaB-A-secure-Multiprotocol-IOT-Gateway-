const mongoose = require('mongoose')
const customerSchema = mongoose.Schema({
    name:{
        type:String,
        trim:true,
       // require:true
    },
    lastname:{
        type:String,
        trim:true
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
    },
  age:{
  type:String
  },
  zip: {
    type: Number,
    trim: true,
    require:true,
  },
  add:{
    type:String
  },
  cart: {
        type: Array,
        default: []
    }
},
{timestamps:true})

module.exports = mongoose.model('Customer',customerSchema)