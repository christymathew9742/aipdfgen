const app = require('./app');
const WebSocket = require('ws'); 
const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('A new client connected');
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`)
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.send('Welcome to the WebSocket server');
});




