require('dotenv').config()
const express = require('express')
const mqtt = require('mqtt');
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')

// MQTT setup
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Adjust to your MQTT broker's address

// When connected to the MQTT broker
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('project/+/data', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err.message);
        } else {
            console.log('Subscribed to project data topics');
        }
    });
});


// Handling incoming messages
mqttClient.on('message', (topic, message) => {
    const topicParts = topic.split('/');
    if (topicParts.length === 3 && topicParts[0] === 'project' && topicParts[2] === 'data') {
        const projectId = topicParts[1];
        const data = JSON.parse(message.toString());

        const tableName = `project_${projectId}`;
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

        db.run(query, values, function (err) {
            if (err) {
                console.error(`Failed to insert data for project ${projectId}:`, err.message);
            } else {
                console.log(`Data inserted successfully into project_${projectId}`);
            }
        });
    }
});


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
app.use('/project',require('./router/ProjectRouter'))


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

 