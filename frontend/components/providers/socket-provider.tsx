"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth-store";
import { usePollStore } from "@/store/poll-store";
import { toast } from "sonner";

interface SocketContextType {
    socket: any;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { token, isAuthenticated } = useAuthStore();
    const { updatePollResults } = usePollStore();
    const [isConnected, setIsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState<any>(null);

    useEffect(() => {
        if (isAuthenticated && token) {
            const socket = getSocket(token);
            if (socket) {
                socket.connect();
                setSocketInstance(socket);

                socket.on("connect", () => {
                    setIsConnected(true);
                    console.log("Socket connected");
                });

                socket.on("disconnect", () => {
                    setIsConnected(false);
                    console.log("Socket disconnected");
                });

                socket.on("vote:new", (data: { pollId: number; results: any }) => {
                    console.log("New vote received via socket:", data);
                    updatePollResults(data.pollId, data.results);
                });

                socket.on("poll:ended", (data: { pollId: number; finalResults: any }) => {
                    console.log("Poll ended via socket:", data);
                    updatePollResults(data.pollId, data.finalResults);
                    toast.info("Un sondage auquel vous participez est terminé.");
                });

                return () => {
                    socket.off("connect");
                    socket.off("disconnect");
                    socket.off("vote:new");
                    socket.off("poll:ended");
                    socket.disconnect();
                };
            }
        } else {
            disconnectSocket();
            setIsConnected(false);
            setSocketInstance(null);
        }
    }, [isAuthenticated, token, updatePollResults]);

    return (
        <SocketContext.Provider value={{ socket: socketInstance, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
