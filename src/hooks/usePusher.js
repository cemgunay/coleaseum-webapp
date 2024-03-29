import { useContext } from "react";
import { PusherContext } from "@/context/PusherContext";

export const usePusher = () => {
    return useContext(PusherContext);
};
