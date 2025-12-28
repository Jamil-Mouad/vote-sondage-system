import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const getSocket = (token?: string) => {
    if (!socket && typeof window !== "undefined") {
        socket = io(SOCKET_URL, {
            auth: {
                token: token,
            },
            transports: ["websocket"],
            autoConnect: false,
        });
    } else if (socket && token) {
        socket.auth = { token };
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
