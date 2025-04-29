const express = require('express');
const chatBotRoutes = require('./routes/chatBotRoutes');
const uploadRoutes = require('./routes/uploadsRoutes'); 
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5001',
    'https://mozilla.github.io',
    "https://aipdfgenfe-christy.vercel.app/",
];

app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    next();
});

app.use(cors({
    origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
        callback(null, true);
    } else {
        console.warn(`Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    }
    },
    methods: ['GET', 'HEAD', 'OPTIONS', 'POST'], 
    allowedHeaders: ['Content-Type', 'Range'],
    exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges'],
    maxAge: 86400, 
}));

app.options('*', cors()); 

connectDB();

// Routes
app.use('/api/chatbot', chatBotRoutes); 
app.use('/api/uploads', uploadRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;


