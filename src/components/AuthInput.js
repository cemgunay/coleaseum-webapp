import React from "react";
import Input from "@/components/Input";
import { cn } from "@/utils/utils";

// input component to be used for auth forms etc.
// provides functionality for error messages and error styling
const AuthInput = ({ title, error, touched, className, ...props }) => {
    return (
        <div className={cn("flex flex-col", className)}>
            <label className="text-base font-medium text-slate-900 mb-1 ml-0">{title}</label>
            <Input className={touched && error ? "border-red-500" : ""} {...props} />
            {touched && error && <p className="text-sm ml-3 mt-1 text-red-500">{error}</p>}
        </div>
    );
};

export default AuthInput;
