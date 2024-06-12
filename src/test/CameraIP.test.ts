import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

import CameraIP from "../CameraIP";
import { createPeerConnection, handleWebRTCMessage } from "../webRTC";
import { create } from "domain";
import { createWebSocket } from "../webSocket";
import { send } from "process";

jest.mock("./webRTC", () => ({
    createPeerConnection: jest.fn().mockResolvedValue({
        createOffer: jest.fn().mockResolvedValue({ sdp: "offer" }),
        setLocalDescription: jest.fn().mockResolvedValue(undefined),
        setRemoteDescription: jest.fn().mockResolvedValue(undefined),
        addIceCandidate: jest.fn().mockResolvedValue(undefined),
        oniceCandidate: null,
        ontrack: null,
        iceConnectionState: 'connected'
    }),
    handleWebRTCMessage: jest.fn()
}));

jest.mock("./webSocket", () => ({
    createWebSocket: jest.fn().mockImplementation(() => ({
        send: jest.fn(),
        close: jest.fn(),
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null
    }))
}));

describe("Camera IP Component", () => {
    test("Renders without crashing", () => {
        render(CameraIP());
        const videoElement = screen.getByRole("video");
        expect(videoElement).toBeInTheDocument();
    });

    test("Init WebSocket and WebRTC connection on mount", async () => {
        render(CameraIP());

        // Verify webSocket init
        const { createWebSocket } = require("../webSocket");
        expect(createWebSocket).toHaveBeenCalledWith("ws://localhost:2000/api/stream");

        // Mock WebSocket
        const webSocket = createWebSocket.mock.results[0].value;
        const { createPeerConnection } = require("../webRTC");
        const peerConnection = createPeerConnection.mock.results[0].value;

        if (webSocket.onopen) {
            webSocket.onopen(new Event("open"));
        }

        expect(peerConnection.createOffer).toHaveBeenCalled();
        expect(peerConnection.setLocalDescription).toHaveBeenCalledWith(JSON.stringify({ sdp: "offer" }));
        expect(webSocket.send).toHaveBeenCalledWith(JSON.stringify({ offer: { sdp: "offer" } }));
    });

    test("Handles incoming WebSocket msg", async () => {
        render(CameraIP());

        // Verify webSocket init
        const { createWebSocket } = require("../webSocket");
        expect(createWebSocket).toHaveBeenCalledWith("ws://localhost:2000/api/stream");

        // Mock WebSocket
        const webSocket = createWebSocket.mock.results[0].value;
        const { createPeerConnection } = require("../webRTC");
        const peerConnection = createPeerConnection.mock.results[0].value;
        
    })
})
