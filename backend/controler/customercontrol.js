const Users = require('../modules/customerModel')
const Products = require('../modules/productModel')
const shopowner = require('../modules/shopownerModel')
const Priest =require('../modules/pristModel')
var nodemailer = require('nodemailer');
require('dotenv').config()
const Razorpay = require('razorpay');
var crypto = require("crypto");
const bcrypt = require('bcrypt')
const jwt =require('jsonwebtoken')

const shopownercontrol ={
    register:async (req,res)=>{
        console.log("customer register")
        try{
            console.log('post')
            const {name,lastname,phone,email,password,age,add,zip} = req.body; 
            console.log(zip)
            var x =parseInt(zip)

            if (x >= 559999 && x <= 560099)
            {
                console.log("zip is valid ")
            }
            else{
                return res.status(500).json({msg:"we don't have service this area"})
            }

            const user = await Users.findOne({email})
            if(user)
                 return res.status(400).json({msg:"THIS EMAIL IS ALREADY EXISTS"})
            if(password.length <6) 
                return res.status(400).json({msg:"THIS   PASSWORD IS TOO WEAK"})
            
            const passwordhash = await bcrypt.hash(password,10)
            const newuser  =await  new Users({
                name,lastname,phone,email,password:passwordhash,zip,age,add
            })
           
           // save mongodb
           await newuser.save()
           // then create jsonwebtoken to auth
           
           const accesstoken = createAccessToken({id:newuser._id})
          //  then create refresh token 
          const refreshtoken = createRefreshToken({id:newuser._id})
          res.cookie('refreshtoken',refreshtoken,
          {
            httpOnly:true,
            path:'/user/refresh_token',
            maxAge:7*24*60*60*1000
          })
           res.json({accesstoken})
        }catch(err)
        {
            return res.status(500).json({msg:err.message})
        }

    },
    login:async (req,res) =>{
        console.log("login")
        try{
            const {email,password} = req.body;
            const user = await Users.findOne({email})
            if(!user)       return res.status(400).json({msg:"THIS User don't  EXISTS"});
            const isMatch = await bcrypt.compare(password,user.password)
            if(!isMatch) return res.status(400).json({msg:"Incorrect Password"});
            // if login success, creat access token and refresh token
            const accesstoken = createAccessToken({id:user._id})
            const refreshtoken = createRefreshToken({id:user._id})
          res.cookie('refreshtoken',refreshtoken,
          {
            httpOnly:true,
            path:'/user/refresh_token',
            maxAge:7*24*60*60*1000

          })
            res.json({accesstoken})
        }
        catch(err)
        {
            return res.status(500).json({msg:err.message})
        }
    },
    
    
    redata:async (req,res) =>{
        console.log("readd")
        try{
            const {name,lastname,phone,email,age,gst,bank,ifsc,add1,add2,add3,add,zip} = await req.body;
            const shopowner  = await Users.findByIdAndUpdate({"_id":req.user.id},{"name":name,add,zip,"lastname":lastname,"phone":phone,"age":age,"gst":gst,"ifsc":ifsc,"bank":bank,"add1":add1,"add2":add2,"add3":add3}) 

            console.log(shopowner)
            shopowner.save()
            res.json({shopowner})
       
        }
        catch(err)
        {
            return res.status(500).json({msg:err.message})


        }
    },
    pooja:async (req,res) =>{
        
        try{
            const {name,lastname,age,email,phone,add,zip,poojname,poojaprize,poojaurl,date,time} = await req.body;
            const customer  = await Users.findById({"_id":req.user.id})
        const r =    await poojabook(customer,name,lastname,email,age,phone,add,zip,poojname,poojaprize,poojaurl,date,time);
         if(1)
         {
            res.json({customer})
         }
         else{
            return res.status(500).json({msg:"we don't have service in your area"})
         }
        }
        catch(err)
        {
            return res.status(500).json({msg:err.message})


        }
    },
    ///sop
    
    cart:async (req,res) =>{
        console.log("add")
        try{
         
            console.log(req.user.id)

            const shopowner  = await Users.findById({"_id":req.user.id}) 
            console.log(shopowner)
            const newproduct = await Products.find({"email":shopowner.email})
            res.json({"list":newproduct})
        }
        catch(err)
        {
            return res.status(500).json({msg:err.message})


        }
    },
    refreshtoken:async (req,res)=>{
        try{
            const rf_token = req.cookies.refreshtoken;
            if(!rf_token) return res.status(400).json({message:"Plase Login or Register"});
            jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET,(err,user)=>
            {
                if(err) return res.status(400).json({message:"PLEASE LOGIN OR rEGISTER"})
                const accesstoken =  createAccessToken({id:user.id})
                res.json({accesstoken})
            })
           
        }catch(err){
            return res.status(500).json({msg:err.message})

        }
    },
    info:async (req,res)=>{
        console.log("infor")
        try{
         
            console.log(req.user.id)

            const user  = await Users.findById({"_id":req.user.id}) 
            const data  = await Products.find({})        
            res.json({"user":user,"products":data})
        }
        catch(err)
        {
            return res.status(500).json({msg:err.message})
        }

    
    } ,
    all:async (req,res)=>{
        console.log("all products")
        try{
         
            const data  = await Products.find({})
            res.json({"products":data,"pooja":data})
        }
        catch(err)
        {
            return res.status(500).json({msg:err.message})

        }
    },
    addCart: async (req, res) =>{
        try {
            const user = await Users.findById(req.user.id)
            if(!user) return res.status(400).json({msg: "User does not exist."})

            await Users.findOneAndUpdate({_id: req.user.id}, {
                cart: req.body.cart
            })

            return res.json({msg: "Added to cart"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
    admin: async (req, res) =>{
        try {
            var cus = await Users.find({})
            var c =  cus.length
            var shop = await shopowner.find({})
            var s =  shop.length
            var pris = await Priest.find({})
            var p =  pris.length
            var prod = await Products.find({})
            var pr =  prod.length


            return res.json({msg: "Getting admins data",c,s,p,pr})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    orders:async (req,res) =>{
        try {
            var {sum} = req.body;
            var instance = new Razorpay({ key_id: process.env.id, key_secret: process.env.secret})

        var options = {
            amount: sum*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "Online Pooja Samagri"
        };

        instance.orders.create(options, function(err, order) 
        {
            if(err)
            {
                return res.status(500).json({msg: "Razorpay server is busy"})
            }
            console.log(order);
            res.json({order})
        });
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }

    },
    
    verfiy: (req,res) =>{
        console.log("statred")
        try {

            console.log("1")
                let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
                console.log("2")
                var expectedSignature = crypto.createHmac('sha256', process.env.secret).update(body.toString()).digest('hex');
                console.log("3")
                if(expectedSignature === req.body.response.razorpay_signature)
                {
                    return res.status(200).json({msg:"donme "})
                }
                return res.status(500).json({msg: err.message})

            }
        catch (err) {
            console.log(err)
            return res.status(500).json({msg: err.message})
        }

    } ,
    
    order:async (req,res) =>{
        console.log("order")
        try{
          
            const customer  = await Users.findById({"_id":req.user.id}) 
   
            usermail(customer,customer.email,customer.cart)
         res.send("done")
        }
        catch(err)
        {
            return res.status(500).json({msg:err.message})
        }
    },
}
//            await poojabook(customer,name,lastname,age,phone,add,zip,poojname,poojaprize,poojaurl);

async function poojabook(customer,name,lastname,email,age,phone,add,zip,poojname,poojaprize,poojaurl,date,time)
{

    try{
        newzip = parseInt(zip)
        var id ;
        const shopowner1 = await Priest.findOne({"zip":zip.toString()})
        console.log(shopowner1)
        if(!shopowner1)
        {
            newzip = newzip+1;
            const  shopowner2 = await Priest.findOne({"zip":newzip.toString()})
            console.log(shopowner2)
           if(!shopowner2)
           {
            newzip = newzip-2;
            const    shopowner3 = await Priest.findOne({"zip":newzip.toString()})
           console.log(shopowner3)
            if(!shopowner3)
                {
                    return 0;

                }
               
               else{
                   id  = shopowner3._id
                }
            }
            else{
            id  = shopowner2._id        
            }
        }
        else{
            id  = shopowner1._id        
        }
        console.log(id)
        const swami = await Priest.findById({"_id":id})
                
        var start ='<h1 style="text-align: center ; background-color: aquamarine;" >Your Pooja Booking</h1>'
        var k =    '<div style="display: flex; align-items: center; background-color: green;border-style: solid; color: white;"><div style="flex: 1; text-align: left;"><img src="'+poojaurl+'" alt="product image " width="250px" height="250px"  /></div><div style="color: white;margin: auto;width: 50%;border: 3px solid green;padding: 10px;"> <h1> Name : '+poojname+'</h1><h1>Price : '+poojaprize+'.00 Rupee</h1> </div></div>'
        var z = '<div style="background-color:green; text-align: center;color:white"><h1>Customer Name : '+name+'</h1><h1>Customer Phone : '+phone+' </h1><h1>Customer Address : '+add+'</h1><h1>Customer Zipcode : '+zip+'</h1></div>'
        var y = '<div style="background-color:green; text-align: center;color:white"><h1>Prist Name : '+customer.name+'</h1><h1>prist Phone : '+customer.phone+' </h1></div>'

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.Email,
              pass: process.env.Password
            },port:465,
            host:'smtp.gmail.com'
          });

        const prist = await Priest.findById({"_id":id})
        var mailOptions = {
            from: process.env.Email, 
            to:prist.email,
            subject: "A pooja ",
            html: start+k+z
          };

          await transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          })
          var l ={name,lastname,age,phone,add,zip,poojname,poojaprize,poojaurl,"email":customer.email,date,time}
          var k = prist.order;
          k.push(l)
          await Priest.findByIdAndUpdate({"_id":prist._id},{"order":k})
          var mailOptions = {
              from: process.env.Email, 
              to:customer.email,
              subject: "A pooja ",
              html: start+k+y
            };
  
            await transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });

          console.log("done")
          return 1
          
    }
    catch(err)
    {
        console.log("something went wrong")
        console.log(err)
        return 0;
    }
    
}






/// products 
//for product buy to send mail to customer and shopkeeper every thing will here

const usermail = async (customer,email,cart)=>
{

    try{
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.Email,
              pass: process.env.Password
            },port:465,
            host:'smtp.gmail.com'
          });
      
        var start ='<h1 style="text-align: center ; background-color: aquamarine;" >Your Orders</h1>'
        for (let i = 0;i<cart.length;i++)
        {
            var rs =    '<div style="display: flex; align-items: center; background-color: green;border-style: solid; color: white;"><div style="flex: 1; text-align: left;"><img src="'+cart[i].url+'" alt="product image " width="250px" height="250px"  /></div><div style="color: white;margin: auto;width: 50%;border: 3px solid green;padding: 10px;"> <h1> Name : '+cart[i].name+'</h1> <h1> Quantity : '+cart[i].size+' Unit</h1><h1>Price : '+cart[i].prize +'.00 Rupee</h1> </div>'
            var z = '<div style="background-color:green; text-align: center;color:white"><h1>Customer Name : '+customer.name+'</h1><h1>Customer Phone : '+customer.phone+' </h1><h1>Customer Address : '+customer.add+'</h1><h1>Customer Zipcode : '+customer.zip+'</h1></div>'
           

              const shopowner1 = await shopowner.findOne({"email":cart[i].email})
              var k = shopowner1.order;
              console.log(shopowner1.order)
              
              var l ={"product":cart[i], "customer":customer}
              console.log(l)
              k.push(l)
              await Products.findByIdAndUpdate({"_id":cart[i]._id},{"N":parseInt(cart[i].N)-1})
              await shopowner.findByIdAndUpdate({"_id":shopowner1._id},{"order":k})
              var k = email
              var mailOptions = {
                from: process.env.Email,
                to: shopowner1.email,
                
                subject: " New Order Coming",
                html: "<div>"+start+rs+'<a href = "mailto:'+k+'">Send Email</a></div>'
              };
        

            await transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              start = start+rs+'</div></br>';

                // This mail goes to shopkeeper

                console.log(shopowner1.email)
               k = shopowner1.email
              var mailOptions = {
                from: process.env.Email,
                to: email,
                subject: "Order Confirmation ",
                html:"<div>"+start+'<a href = "mailto:'+k+'">Send Email</a></div>'
              };
        
              await transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } 
                else {
                  console.log('Email sent: ' + info.response);
                }
              });
        }
 
     
      await remove_list(customer)
      console.log(customer.cart)
    }
    catch(err)
    {
        console.log(err)
    }



}
// for cart clear thi function is used

const remove_list = async( customer) =>{

    var k = customer.cart;
    for(var i=0;i< k.length+2;i++)
    {
        k.pop()
    }

    await Users.findByIdAndUpdate({"_id":customer._id},{"cart":k})

}

const createRefreshToken =(user)=>
{
    return jwt.sign(user,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}
const createAccessToken =(user)=>
{
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}


module.exports = shopownercontrol