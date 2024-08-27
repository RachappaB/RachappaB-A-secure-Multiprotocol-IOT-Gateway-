const Users = require('../modules/userModel')
const bcrypt = require('bcrypt')

const jwt =require('jsonwebtoken')
const { use } = require('../router/userRouter')


const usercontrol ={
  
    
    refreshtoken:(req,res)=>{
        try{
            const rf_token = req.cookies.refreshtoken;
            if(!rf_token) return res.status(400).json({message:"Plase Login or Register"});
            jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET,(err,user)=>
            {
                if(err) return res.status(400).json({message:"PLEASE LOGIN OR rEGISTER"})
                const accesstoken = createAccessToken({id:user.id})
                res.json({accesstoken})
            })
           
        }catch(err){
            return res.status(500).json({msg:err.message})

        }
    
    },
    logout:async (req,res) =>{
        console.log("logout")
        try {
          await  res.clearCookie('refreshtoken',{path:'/user/refresh_token'})
            return res.json({message:"Logout"})
        } catch (error) {
            return res.status(500).json({msg:error.message})
            
        }

    }
}

const createRefreshToken =(user)=>
{
    return jwt.sign(user,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}
const createAccessToken =(user)=>
{
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}

module.exports = usercontrol