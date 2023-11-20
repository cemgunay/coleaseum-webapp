import React from "react";
import { cn } from "@/utils/utils";

// simple button component, just a wrapper around <button>
// propagtes all props and tailwind classes, just adds some styling
const Button = ({ className, children, ...props }) => {
    return (
        <button
            className={cn(
                "text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md bg-black text-white cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
