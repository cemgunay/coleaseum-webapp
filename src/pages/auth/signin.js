import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { jwtDecode } from "jwt-decode";
import { IoClose } from "react-icons/io5";

const SignIn = () => {
    const { saveUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // proceed with form submission
        try {
            setIsSubmitting(true);

            // call signin API route
            const res = await fetch("/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                // signin failed, display error message
                const error = JSON.parse(await res.text()).error;
                setApiError(error);
            } else {
                // signin successful, save user in context and redirect to profile page
                const data = await res.json();
                const user = jwtDecode(data.token).user;
                saveUser(user);
                router.push("/profile");
            }

            setIsSubmitting(false);
        } catch (error) {
            console.error("Signup failed", error);
            setIsSubmitting(false);
            throw new Error(`Signup failed, error not caught by API route:\n${error}`);
        }
    };

    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10 pb-32">
                <h1 className="font-bold text-3xl">Sign In</h1>
                <p className="text-lg text-slate-500">Lorem Ipsum.</p>

                {/* display error message if we have one */}
                {apiError && (
                    <div className="relative self-center w-4/5 rounded-sm px-4 py-4 text-center text-base bg-red-200 text-red-600">
                        <p>{apiError}</p>
                        <IoClose
                            onClick={() => setApiError(null)}
                            className="absolute top-0 right-0 m-1 text-lg cursor-pointer text-slate-700"
                        />
                    </div>
                )}

                {/* form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
                    {/* email input */}
                    <Input
                        placeholder="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    {/* password input */}
                    <Input
                        placeholder="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    {/* submit button */}
                    <Button type="submit">
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                    </Button>
                </form>
                <Link
                    href="/auth/signup"
                    className="self-end mr-2 underline cursor-pointer text-[#61C0BF]"
                >
                    Don't have an account? Sign Up.
                </Link>
            </div>
            <BottomNav />
        </>
    );
};

export default SignIn;
