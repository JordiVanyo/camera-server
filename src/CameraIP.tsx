import { create } from "domain";
import React, { useEffect, useRef } from "react";
import { createWebSocket } from "./webSocket";
import { createPeerConnection, handleWebRTCMessage } from "./webRTC";

/**
 * IPCamera component
 * 
 * This component connects to a WebSocket server to stream video from an IP camera using WebRTC.
 * It establishes a peer-to-peer connection and displays the video stream in a <video> element.
 *
 * @component
 * @example
 * return (
 *   <CameraIP />
 * )
 */
function CameraIP() {
    // Reference to <video> element
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        /**
         * Start streaming the video from the IP camera.
         * This function is called when the component mounts.
         */        
        async function startStreaming() {
            if (videoRef.current) {
                try {
                    // Get the video stream from the IP camera
                    const stream = await getCameraStream();
                    // Assign the stream to the video element
                    videoRef.current.srcObject = stream;
                } catch (error) {
                    console.error('Error accessing camera stream: ', error);
                }
            }
        }

        startStreaming();
    }, []);

    /**
     * Get the video stream from the IP camera.
     * Establishes a WebRTC connection and handles the signaling process via WebSocket.
     *
     * @returns {Promise<MediaStream>} A promise that resolves to the MediaStream object of the video.
     */
    async function getCameraStream(): Promise<MediaStream> {
        // Connects with the WebSocket server
        const webSocket = createWebSocket('ws://localhost:2000/api/stream');
        // Creates a WebRTC connection
        const peerConnection = await createPeerConnection(webSocket);


        return new Promise<MediaStream>((resolve, reject) => {
            // Handle messages received from the WebSocket
            webSocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handleWebRTCMessage(peerConnection, message);
                } catch (error) {
                    console.error('Error parsing JSON message: ', event.data, error);
                }
            };

            // Resolve the promise when a track is received
            peerConnection.ontrack = (event) => {
                resolve(event.streams[0]);
            };

            // Handle ICE connection state changes
            peerConnection.oniceconnectionstatechange = () => {
                if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
                    reject(new Error('ICE connection failed'));
                }
            };

        });
    };

    return (
        <div>
            {/* Video element to display the IP camera stream */}
            <video ref={videoRef} autoPlay controls />
        </div>
    );
};

export default CameraIP;
