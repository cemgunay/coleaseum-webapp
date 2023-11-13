import React from "react";
import Input from "@/components/Input";

// input component to be used for auth forms etc.
// provides functionality for error messages and error styling
const AuthInput = ({ error, touched, ...props }) => {
    return (
        <div className="flex flex-col">
            <Input className={touched && error ? "border-red-500" : ""} {...props} />
            {touched && error && <p className="text-sm ml-3 mt-1 text-red-500">{error}</p>}
        </div>
    );
};

export default AuthInput;
