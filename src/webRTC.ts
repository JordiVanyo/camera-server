import { error } from "console";


/**
 * Creates a Peer-to-Peer connection using a throught a WebSocket
 * 
 * @param webSocket WebSocket
 * @returns {Promise<MediaStream>} Promise that resolves the MediaStream object of the video
 */
export async function createPeerConnection(webSocket: WebSocket): Promise<RTCPeerConnection> {
    // Creates a WebRTC connection
    const peerConnection = new RTCPeerConnection();

    // Send ICE candidates to the WebSocket
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            webSocket.send(JSON.stringify({ iceCandidate: event.candidate }));
        }
    };

    // Create an offer and set it as the local description
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
     // Send the offer to the WebSocket
    webSocket.send(JSON.stringify({ offer }));

    return peerConnection;
}

/**
 * Handle messages received from the WebSocket
 * 
 * @param peerConnection RTCPeerConnection
 * @param message Any
 */
export function handleWebRTCMessage(peerConnection: RTCPeerConnection, message: any) {
    if (message.answer) {
        // Set the remote description from the answer
        peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer))
            .catch(error => console.error("Error setting remote description: ", error));
    } else if (message.iceCandidate) {
        // Add the ICE candidate to the peer connection
        peerConnection.addIceCandidate(new RTCIceCandidate(message.iceCandidate))
            .catch(error => console.error("Error adding ICE candidate: ", error));
    }
}