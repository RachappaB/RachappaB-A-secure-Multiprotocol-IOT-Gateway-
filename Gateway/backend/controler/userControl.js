const Users = require('../modules/userModel')
const bcrypt = require('bcryptjs')

const jwt =require('jsonwebtoken')


const usercontrol ={
   
 
    refreshtoken: (req, res) => {
        try {
            console.log("Cookies received:", req.cookies); // Log cookies
            const rf_token = req.cookies.refreshtoken;
            if (!rf_token) {
                console.log("No refresh token found");
                return res.status(400).json({ message: "Please login or register" });
            }
    
            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) {
                    console.log("Token verification failed:", err.message);
                    return res.status(400).json({ message: "Please login or register" });
                }
    
                const accesstoken = createAccessToken({ id: user.id });
                res.json({ accesstoken });
            });
    
        } catch (err) {
            console.error("Error during token refresh:", err.message);
            return res.status(500).json({ msg: err.message });
        }
    }
,    
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