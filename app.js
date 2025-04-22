// const express = require('express');
// const productRoutes = require('./routes/productRoutes'); 
// const authRoutes = require('./routes/authRoutes');
// const departmentRoute = require('./routes/deparmentRoute/departmentRoute')
// const chatBotRoute = require('./routes/chatBotRoute/chatBotRoute')
// const whatsappRoutes = require('./routes/whatsappRoutes/whatsappRoutes');
// const bodyParser = require('body-parser');
// const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

// const errorHandler = require('./middlewares/errorHandler');
// const connectDB = require('./config/db');
// require('dotenv').config();

// const app = express();

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// const cors = require('cors');

// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     credentials: true,
// }));

// connectDB();

// app.use('/api/auth', authRoutes);   
// app.use('/api/products', productRoutes);
// app.use('/api/department', departmentRoute),
// app.use('/api/createbots', chatBotRoute),
// app.use('/api/whatsapp', whatsappRoutes);
// app.use(bodyParser.json());
// app.use(errorHandler);

// module.exports = app;


const express = require('express');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadsRoutes'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5001'];
app.use(cors({
    origin: (origin, callback) => {
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/uploads', uploadRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;

































 
