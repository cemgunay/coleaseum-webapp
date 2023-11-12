import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import { set } from "mongoose";
import { cn } from "@/utils/utils";

// function to validate email
const validateEmail = (email) => {
    // simple regex for email validation
    const re = /\S+@\S+\.\S+/;
    return re.test(email) ? null : "Invalid email address";
};

// function to validate password
const validatePassword = (password) => {
    // check length
    if (password.length < 8) {
        return "Password must be at least 8 characters";
    }

    // // check for uppercase letter (commented out for now)
    // if (!/[A-Z]/.test(password)) {
    //     return "Password must contain at least one uppercase letter";
    // }

    // more conditions here as needed, will discuss w Cem

    // returning null if all conditions met (i.e. no error)
    return null;
};

const SignupPage = () => {
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        email: false,
        password: false,
        confirmPassword: false,
    });

    // handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // we could also validate inputs on change instead of submit
        // think I might swap to this
    };

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
        };
        setErrors(newErrors);

        const isValid = Object.values(newErrors).every((error) => error === null);
        if (isValid) {
            // proceed with form submission
            try {
                // call signup API route
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    throw new Error("Signup failed. No 200 status code returned from API route.");
                }

                // response.ok is true, so grab response data
                const data = await res.json();
                if (data.success) {
                    // update user context
                    setUser(data.user);
                } else {
                    // handle errors here, will have to do this in UI and that will entail code here
                    // just a console log for now
                    console.error("API route returned success: false");
                }
            } catch (error) {
                console.error("Signup failed", error);
                throw new Error(`Signup failed, error not caught by API route:\n${error}`);
            }
        }
    };

    // function to validate when user leaves input field
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, formData[name]) });
    };

    // function to choose appropriate validation function
    const validate = (name, value) => {
        switch (name) {
            case "email":
                return validateEmail(value);
            case "password":
                return validatePassword(value);
            case "confirmPassword":
                if (value !== formData.password) {
                    return "Passwords do not match";
                }
                return null;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10">
                <h1 className="font-bold text-3xl">Sign Up</h1>
                <p className="text-lg text-slate-500">Lorem Ipsum.</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
                    {/* email input */}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                            "border border-slate-300 rounded-md w-full h-11 px-4 py-2",
                            touched.email && errors.email ? "border-red-500" : "border-slate-300"
                        )}
                    />
                    {touched.email && errors.email && (
                        <p className="text-sm ml-3 -mt-2 text-red-500">{errors.email}</p>
                    )}

                    {/* password input */}
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                            "border border-slate-300 rounded-md w-full h-11 px-4 py-2",
                            touched.password && errors.password
                                ? "border-red-500"
                                : "border-slate-300"
                        )}
                    />
                    {touched.password && errors.password && (
                        <p className="text-sm ml-3 -mt-2 text-red-500">{errors.password}</p>
                    )}

                    {/* confirm password input */}
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn(
                            "border border-slate-300 rounded-md w-full h-11 px-4 py-2",
                            touched.confirmPassword && errors.confirmPassword
                                ? "border-red-500"
                                : "border-slate-300"
                        )}
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                        <p className="text-sm ml-3 -mt-2 text-red-500">{errors.confirmPassword}</p>
                    )}

                    {/* submit button */}
                    <button
                        type="submit"
                        className="text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md border bg-black text-white cursor-pointer"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
            <BottomNav />
        </>
    );
};

export default SignupPage;
