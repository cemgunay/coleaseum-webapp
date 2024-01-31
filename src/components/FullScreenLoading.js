import { CircularProgress } from "@mui/material";
import React from "react";

const FullScreenLoader = () => {
    return (
        <div
            className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50"
            style={{ zIndex: 10000 }}
        >
            <CircularProgress size={24} color="inherit" />
        </div>
    );
};

export default FullScreenLoader;
