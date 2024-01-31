import React, { forwardRef } from "react";
import Input from "@/components/Input";
import { cn } from "@/utils/utils";

const AuthInput = forwardRef(
    (
        { title, error, touched, className, classNameInput, isPrice, ...props },
        ref
    ) => {
        return (
            <div className={cn("flex flex-col", className)}>
                <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                    {title}
                </label>
                <div className="flex justify-center items-center gap-2 w-full">
                    {isPrice && <div className="text-lg font-semibold">$</div>}
                    <Input
                        ref={ref}
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
    }
);

export default AuthInput;
