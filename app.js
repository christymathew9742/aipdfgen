const express = require('express');
const productRoutes = require('./routes/productRoutes'); 
const authRoutes = require('./routes/authRoutes');
const departmentRoute = require('./routes/deparmentRoute/departmentRoute')
const chatBotRoute = require('./routes/chatBotRoute/chatBotRoute')
const whatsappRoutes = require('./routes/whatsappRoutes/whatsappRoutes');
const bodyParser = require('body-parser');
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const cors = require('cors');

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

connectDB();

app.use('/api/auth', authRoutes);   
app.use('/api/products', productRoutes);
app.use('/api/department', departmentRoute),
app.use('/api/createbots', chatBotRoute),
app.use('/api/whatsapp', whatsappRoutes);
app.use(bodyParser.json());
app.use(errorHandler);

module.exports = app;





// const axios = require('axios')
// const FormData = require('form-data')
// const fs = require('fs')

// async function sendTemplateMessage() {
//     const response = await axios({
//         url: 'https://graph.facebook.com/v20.0/phone_number_id/messages',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.META_API_TOKEN}`,
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
//             messaging_product: 'whatsapp',
//             to: 'phone_number',
//             type: 'template',
//             template:{
//                 name: 'discount',
//                 language: {
//                     code: 'en_US'
//                 },
//                 components: [
//                     {
//                         type: 'header',
//                         parameters: [
//                             {
//                                 type: 'text',
//                                 text: 'John Doe'
//                             }
//                         ]
//                     },
//                     {
//                         type: 'body',
//                         parameters: [
//                             {
//                                 type: 'text',
//                                 text: '50'
//                             }
//                         ]
//                     }
//                 ]
//             }
//         })
//     })

//     console.log(response.data)
// }

// async function sendTextMessage() {
//     const response = await axios({
//         url: ' https://graph.facebook.com/v21.0/523578740831980/messages',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.META_API_TOKEN}`,
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
//             messaging_product: 'whatsapp',
//             to: '918921779490',
//             type: 'text',
//             text:{
//                 body: 'This is a text message'
//             }
//         })
//     })

//     console.log(response.data) 
// }

// async function sendMediaMessage() {
//     const response = await axios({
//         url: 'https://graph.facebook.com/v20.0/phone_number_id/messages',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.META_API_TOKEN}`,
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
//             messaging_product: 'whatsapp',
//             to: 'phone_number',
//             type: 'image',
//             image:{
//                 //link: 'https://dummyimage.com/600x400/000/fff.png&text=manfra.io',
//                 id: '512126264622813',
//                 caption: 'This is a media message'
//             }
//         })
//     })

//     console.log(response.data)    
// }

// async function uploadImage() {
//     const data = new FormData()
//     data.append('messaging_product', 'whatsapp')
//     data.append('file', fs.createReadStream(process.cwd() + '/logo.png'), { contentType: 'image/png' })
//     data.append('type', 'image/png')

//     const response = await axios({
//         url: 'https://graph.facebook.com/v20.0/phone_number_id/media',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
//         },
//         data: data
//     })

//     console.log(response.data)     
// }

// sendTemplateMessage()

 //sendTextMessage()

// sendMediaMessage()

// uploadImage()


























 
