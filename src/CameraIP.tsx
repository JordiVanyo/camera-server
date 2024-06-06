// import { resolve } from "path";
import React, { useEffect, useRef } from "react";

/**
 * IPCamera component
 * 
 * This component connects to a WebSocket server to stream video from an IP camera using WebRTC.
 * It establishes a peer-to-peer connection and displays the video stream in a <video> element.
 *
 * @component
 * @example
 * return (
 *   <IPCamera />
 * )
 */
function CameraIP() {
    const videoRef = useRef<HTMLVideoElement>(null);    // Reference to <video> element

    useEffect(() => {
        /**
         * Start streaming the video from the IP camera.
         * This function is called when the component mounts.
         */        
        async function startStreaming() {
            if (videoRef.current) {
                try {
                    const stream = await getCameraStream();
                    videoRef.current.srcObject = stream;
                } catch (error) {
                    console.error('Error accessing camera stream: ', error);
                }
            }
        };

        startStreaming();
    }, []);

    /**
     * Get the video stream from the IP camera.
     * Establishes a WebRTC connection and handles the signaling process via WebSocket.
     *
     * @returns {Promise<MediaStream>} A promise that resolves to the MediaStream object of the video.
     */
    async function getCameraStream(): Promise<MediaStream> {
        const peerConnection = new RTCPeerConnection(); // Creates a WebRTC connection
        const webSocket = new WebSocket('ws://localhost:2000/api/stream'); // Connects with the websocket 

        // Manage messages received from the websocket
        webSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.answer) {
                peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
            } else if (message.iceCandidate) {
                peerConnection.addIceCandidate(new RTCIceCandidate(message.iceCandidate));
            }
        };

        // Send ICE candidates to the websocket
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                webSocket.send(JSON.stringify({ iceCandidate: event.candidate }));
            }
        };

        // Create an offer and set it as the local description
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send the offer to the websocket
        webSocket.onopen = () => {
            webSocket.send(JSON.stringify({ offer: offer }));
        };

        // Return a promise that resolves to the MediaStream once a track is received
        return new Promise<MediaStream>((resolve) => {
            peerConnection.ontrack = (event) => {
                resolve(event.streams[0]);
            };
        });
    };

    return (
        <div>
            <video ref={videoRef} autoPlay controls />
        </div>
    );
};

export default CameraIP;