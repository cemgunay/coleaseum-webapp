import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import Input from "@/components/Input";
import { Button } from "@/components/ui/button";
import CircularProgress from "@mui/material/CircularProgress";
import { IoClose } from "react-icons/io5";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { BsGoogle } from "react-icons/bs";
import { useAuth } from "@/hooks/useAuth";
import Skeleton from "@/components/Skeleton";

const SignIn = () => {
    const { toast } = useToast();
    const router = useRouter();
    const { error } = router.query;
    const { status } = useAuth();

    useEffect(() => {
        if (status === "authenticated") {
            // User is already signed in, redirect to home or another page
            router.replace("/");
        }
    }, [status, router]);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [apiError, setApiError] = useState("");

    useEffect(() => {
        if (error === "AccountNotLinked") {
            setApiError(
                "Please sign in with your original method to link your accounts."
            );
        }
    }, [error]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    //handle social sign in
    const handleSocialClick = (action) => {
        signIn(action, { callbackUrl: "/profile" });
    };

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const result = await signIn("credentials", {
                ...formData,
                redirect: false,
            });

            // Check if signIn was not successful
            if (!result.ok) {
                // If there's an error message, display it using toast
                if (result.error) {
                    toast({
                        variant: "destructive",
                        title: result.error,
                    });
                    setApiError(result.error);
                }
            } else {
                // If signIn was successful, redirect to the profile page
                router.push("/profile");
            }
        } catch (error) {
            // If an exception occurred, handle it here
            toast({
                variant: "destructive",
                title: "An error occurred during sign in.",
            });
            console.error("Sign in failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const Loading = () => {
        return (
            <div>
                <Skeleton className={"w-4 h-4"} />
            </div>
        );
    };

    if (status === "loading" || status === "authenticated") {
        return <Loading />;
    }

    return (
        <>
            <div className="flex flex-col items-start justify-start gap-5 mx-8 pt-10 pb-32">
                <h1 className="font-bold text-2xl">Sign In</h1>
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
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* email input */}
                    <Input
                        disabled={isSubmitting}
                        placeholder="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    {/* password input */}
                    <Input
                        disabled={isSubmitting}
                        placeholder="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {/* submit button */}
                    <Button
                        className={"w-full"}
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                {/* Line separator with text */}
                <div className="relative w-full text-sm">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-gray-500">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 w-full">
                    {/* Social Buttons */}
                    <Button
                        className={
                            "inline-flex items-center gap-2 w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                        }
                        onClick={() => handleSocialClick("google")}
                    >
                        <BsGoogle />
                        Google
                    </Button>
                    {/* Add more social buttons as needed */}
                </div>

                <div className="w-full flex flex-col items-end gap-2 text-sm text-gray-500">
                    <Link
                        href="/auth/reset-password"
                        className="self-end mr-2 underline cursor-pointer text-[#61C0BF]"
                    >
                        Forgot Password
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="self-end mr-2 underline cursor-pointer text-[#61C0BF]"
                    >
                        Don't have an account? Sign Up.
                    </Link>
                </div>
            </div>
            <BottomNav />
        </>
    );
};

export default SignIn;
