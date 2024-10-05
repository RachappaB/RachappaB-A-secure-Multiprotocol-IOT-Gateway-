const mongoose = require('mongoose')
const productSchema = mongoose.Schema({
    name:{
        type:String,
        trim:true,
        require:true
        
    },
    about:{
        type:String,
        // required:true,
        trim:true
    },
    N:{
        type:String,
        required:true
    },
    prize:{
        type:String,
        trim:true,
       required:true
    },
    url:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        trim:true,
        required:true

    }
},
    {timestamps:true})
    
    module.exports = mongoose.model('Products',productSchema)