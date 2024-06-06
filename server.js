const express = require('express');
const expressWs = require('express-ws');
const { proxy } = require('rtsp-relay')(express);

/**
 * Initializes and configures the Express application.
 * Sets up WebSocket handling with express-ws and RTSP relay.
 *
 * @module server
 */

const app = express();  // Instance of an express app
expressWs(app);         // Allow the use of WebSockets to the express app

/**
 * WebSocket route for streaming video from an IP camera.
 * Uses rtsp-relay to proxy the RTSP stream to WebRTC-compatible WebSocket.
 *
 * @name /api/stream
 * @function
 * @param {string} url - The RTSP URL of the IP camera.
 * @param {boolean} verbose - If true, logs detailed information to the console.
 */
app.ws('/api/stream', proxy({
    url: 'rtsp://user:pass@ip/stream-path', // URL of the IP Camera
    verbose: false, // Show detailed information
}));

/**
 * Starts the Express server on the specified port.
 *
 * @param {number} port - The port number on which the server should listen.
 */
app.listen(2000, () => {
    console.log('Server is running on port 2000');
});