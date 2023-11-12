import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";

const validateEmail = (email) => {
    // simple regex for email validation
    const re = /\S+@\S+\.\S+/;
    return re.test(email) ? null : "Invalid email address";
};

const validatePassword = (password) => {
    // check length
    if (password.length < 8) {
        return "Password must be at least 8 characters";
    }

    // // check for uppercase letter
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
    });
    const [errors, setErrors] = useState({});

    // const handleChange = (e) => {
    //     // Update formData
    // };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     // Perform front-end validation
    //     // POST request to backend
    //     // On success, update AuthContext and redirect
    //     // On failure, show error message
    // };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // we could also validate inputs on change instead of submit
        // think I might swap to this
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
        };
        setErrors(newErrors);

        const isValid = Object.values(newErrors).every((error) => error === null);
        if (isValid) {
            // Proceed with form submission
        }
    };

    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10">
                <h1 className="font-bold text-3xl">Sign Up</h1>
                <p className="text-lg text-slate-500">Lorem Ipsum.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p>{errors.email}</p>}

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <p>{errors.password}</p>}

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
