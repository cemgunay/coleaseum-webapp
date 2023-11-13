import React from "react";
import { cn } from "@/utils/utils";

// simple input component, just a wrapper around <input>
// propagtes all props and tailwind classes, just adds some styling
const Input = ({ className, ...props }) => {
    return (
        <input
            className={cn("border border-slate-300 rounded-md w-full h-11 px-4 py-2", className)}
            {...props}
        />
    );
};

export default Input;
