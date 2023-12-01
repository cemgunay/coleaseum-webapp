import React from "react";
import { cn } from "@/utils/utils";
import TextArea from "./TextArea";

// input component to be used for auth forms etc.
// provides functionality for error messages and error styling
const AuthTextArea = ({
    title,
    error,
    touched,
    className,
    classNameInput,
    classNameError,
    ...props
}) => {
    return (
        <div className={cn("flex flex-col", className)}>
            <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                {title}
            </label>
            <TextArea
                classNameInput={cn(
                    touched && error ? "border-red-500" : "",
                    classNameInput
                )}
                {...props}
            />
            {touched && error && (
                <p className={cn("text-sm ml-3 mt-1 text-red-500", classNameError)}>{error}</p>
            )}
        </div>
    );
};

export default AuthTextArea;
