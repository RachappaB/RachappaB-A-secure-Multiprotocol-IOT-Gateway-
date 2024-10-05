const jwt = require('jsonwebtoken')
const Users = require('../modules/productModel')
const auth = (req,res,next)=>{
 //   console.log("auth")
    try{
        const token =req.header("Authorization")
        if(!token) return res.status(400).json({msg:"Invalid Authentication"});
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user) =>{
            if(err) return res.status(400).json({msg:"Invalid Authentication"});
            req.user= user
            next()
        })
    }
    catch(err)
    {
        return res.status(500).json({msg:"Invalid Authentication"});
    }
}

module.exports = auth