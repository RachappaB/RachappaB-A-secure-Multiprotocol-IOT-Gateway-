const mongoose = require('mongoose')
const shopownerSchema = mongoose.Schema({
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
    shopname:{
    type: String,
        trim: true,
  },
  age:{
  type:String
  },
  gst:{
    type:String
  },
  bank:{

    typeof:String
  },
  ifsc:{
    typeof:String
  },

  shopadd:{
    type: String,
    trim: true,
  },
  zip: {
    type: Number,
    trim: true,
    required: true,
  }, order: {
    type: Array,    
    default: []
}
},
{timestamps:true})

module.exports = mongoose.model('Owner',shopownerSchema)