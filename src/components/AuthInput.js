import React from "react";
import Input from "@/components/Input";
import { cn } from "@/utils/utils";

// input component to be used for auth forms etc.
// provides functionality for error messages and error styling
// can change the class of div and input accordingly
// can show dollar sign if isPrice is provided
const AuthInput = ({
    title,
    error,
    touched,
    className,
    classNameInput,
    isPrice,
    ...props
}) => {
    return (
        <div className={cn("flex flex-col", className)}>
            <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                {title}
            </label>
            <div className="flex justify-center items-center gap-2 w-full">
                {isPrice ? (
                    <div className="text-lg font-semibold">$</div>
                ) : null}
                <Input
                    className={cn(
                        touched && error ? "border-red-500" : "",
                        classNameInput
                    )}
                    {...props}
                />
            </div>

            {touched && error && (
                <p className="text-sm ml-3 mt-1 text-red-500">{error}</p>
            )}
        </div>
    );
};

export default AuthInput;
