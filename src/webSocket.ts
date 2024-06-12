import { error } from "console";

/**
 * Creates a WebSocket connection
 * 
 * @param url String
 * @returns {WebSocket} WebSocket server connection
 */
export function createWebSocket(url: string) : WebSocket {
    // Connects with the WebSocket server
    const webSocket = new WebSocket(url);

    // Handle WebSocket errors
    webSocket.onerror = (error) => {
        console.error("WebSocket error: ", error);
        Promise.reject(new Error("WebSocket connection failed"));
    };

    return webSocket;
}