import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CircularProgress } from "@mui/material";
import { BsCheckCircleFill, BsFillXCircleFill } from "react-icons/bs";
import { useAuth } from "@/hooks/useAuth";

const VerifyEmail = () => {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const router = useRouter();
    const { token } = router.query;

    const { status } = useAuth();

    useEffect(() => {
        if (status === "authenticated") {
            // User is already signed in, redirect to home or another page
            router.push("/auth/signin");
        }
    }, [status, router]);

    useEffect(() => {
        const verifyEmail = async () => {
            let response; // Declare response outside the try block
            if (token) {
                setIsLoading(true);
                try {
                    response = await fetch("/api/emails/verify-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token }),
                    });
                    const data = await response.json();
                    setMessage(data.message);
                    setIsVerified(response.ok);
                    if (response.ok) {
                        // Remove email from local storage on successful verification
                        localStorage.removeItem("email");
                    }
                } catch (error) {
                    setMessage("There was an error processing your request.");
                    console.error("Email verification error:", error);
                } finally {
                    setIsLoading(false);
                    if (response && response.ok) {
                        // Redirect after 5 seconds
                        const timer = setTimeout(() => {
                            router.push("/auth/signin");
                        }, 5000);

                        return () => clearTimeout(timer);
                    }
                }
            } else {
                setMessage(
                    "No email verification token found. Please check your email or request a new verification email."
                );
            }
        };

        if (router.isReady) {
            verifyEmail();
        }
    }, [router.isReady, token]);

    const Loading = () => {
        return (
            <div className="flex flex-col items-center justify-center gap-5 mx-8 pt-10 pb-32">
                <CircularProgress size={50} color="inherit" />
                <div>We're verifying your email. Please wait.</div>
            </div>
        );
    };

    if (isLoading || status === "loading") {
        return <Loading />;
    }

    const Verified = () => {
        return (
            <div className="flex flex-col items-center justify-center gap-5 mx-8 pt-10 pb-32">
                <BsCheckCircleFill
                    size={50}
                    style={{ color: "var(--color-primary)" }}
                />
                <div>{message}</div>
                <a
                    href="/auth/signin"
                    className="text-sm text-color-secondary-light underline"
                >
                    Click here if you are not redirected.
                </a>
            </div>
        );
    };

    //Need better handling here to allow user to maybe try again?
    const NotVerified = () => {
        return (
            <div className="flex flex-col items-center justify-center gap-5 mx-8 pt-10 pb-32">
                <BsFillXCircleFill
                    size={50}
                    style={{ color: "var(--color-error)" }}
                />
                <div>{message}</div>
            </div>
        );
    };

    if (isVerified) {
        return <Verified />;
    } else {
        return <NotVerified />;
    }
};

export default VerifyEmail;
