import { send } from "process";
import { createPeerConnection, handleWebRTCMessage } from "../webRTC";

test("createPeerConnection should send offer", async () => {
    const testWebSocket = { send: jest.fn() } as unknown as WebSocket;
    const testPeerConnection = await createPeerConnection(testWebSocket);

    expect(testWebSocket.send).toHaveBeenCalledWith(expect.stringContaining("offer"));
});

test("handleWebRTCMessage should handle answer", async () => {
    const testPeerConnection = {
        setRemoteDescription: jest.fn().mockResolvedValue(undefined),
        addIceCandidate: jest.fn().mockResolvedValue(undefined)
    } as unknown as RTCPeerConnection;
    const message = { answer: { type: 'answer', sdp: 'mockAnswer' } };
    
    handleWebRTCMessage(testPeerConnection, message);
    expect(testPeerConnection.setRemoteDescription).toHaveBeenCalledWith(expect.any(RTCSessionDescription));
})