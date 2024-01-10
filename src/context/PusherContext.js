import React, { createContext, useState, useEffect } from "react";
import Pusher from "pusher-js";

export const PusherContext = createContext();

export const PusherProvider = ({ children }) => {
    const [pusher, setPusher] = useState(null);

    useEffect(() => {
        // Initialize Pusher only on the client side
        const newPusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        });
        setPusher(newPusher);

        // Cleanup on unmount
        return () => newPusher.disconnect();
    }, []);

    return (
        <PusherContext.Provider value={pusher}>
            {children}
        </PusherContext.Provider>
    );
};
