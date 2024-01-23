import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import Skeleton from "@/components/Skeleton";
import { useAuth } from "@/hooks/useAuth";

const ResetPasswordPage = () => {
    const [isValidToken, setIsValidToken] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { token } = router.query;
    const { status } = useAuth();

    useEffect(() => {
        if (status === "authenticated") {
            // User is already signed in, redirect to home or another page
            router.replace("/auth/signin");
        }
    }, [status, router]);

    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    const response = await fetch(
                        "/api/emails/verify-reset-password-token",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token }),
                        }
                    );
                    if (response.ok) {
                        setIsValidToken(true);
                        // Remove email from local storage on successful password token verification
                        localStorage.removeItem("email");
                    }
                } catch (error) {
                    console.error("Error verifying token:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        if (router.isReady) {
            verifyToken();
        }
    }, [router.isReady, token]);

    if (isLoading || status === "loading" || status === "authenticated") {
        return (
            <div>
                <Skeleton className={"w-4 h-4"} />
            </div>
        );
    }

    if (!isLoading && isValidToken) {
        return <ChangePasswordForm resetPasswordToken={token} />;
    } else {
        return <ResetPasswordForm />;
    }
};

export default ResetPasswordPage;
