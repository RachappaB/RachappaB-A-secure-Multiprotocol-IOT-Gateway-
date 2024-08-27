require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')


const app = express()
app.use(cookieParser())
app.use(fileUpload({useTempFiles:true}))
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend origin
    credentials: true // Allow credentials (cookies, authorization headers)
}));

//connect to mongodb
mongoose.connect(process.env.MONGODB_URI,  err =>{
    if(err) throw err;
    console.log('CONNECTED  TO MONGODB')
}
)

//Router
app.use('/customer',require('./router/cutomer'))
app.use('/user',require('./router/userRouter'))


app.get('/user/refresh_token', (req, res) => {
    const rf_token = req.cookies.refreshtoken;
    if (!rf_token) return res.status(400).json({ message: 'Please login or register' });

    jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(400).json({ message: 'Invalid authentication' });
        const accesstoken = createAccessToken({ id: user.id });
        res.json({ accesstoken });
    });
});

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};



app.get('/',function(req,res)
{
    res.json({msg:"welcome to server"})
})
app.listen(process.env.PORT,err=>{
    console.log('Server running')
    
})

 