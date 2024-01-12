import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/Skeleton";
import { signIn } from "next-auth/react";
import { BsGoogle } from "react-icons/bs";

const AccountSettings = () => {
    const router = useRouter();

    const { user: contextUser, status } = useAuth();

    console.log(contextUser);

    //handle social sign in
    const handleSocialClick = (action) => {
        signIn(
            action,
            { callbackUrl: "/profile" },
        );
    };

    const Loading = () => {
        return (
            <div>
                <Skeleton className={"w-4, h-4"} />
            </div>
        );
    };

    if (status === "loading") {
        return <Loading />;
    }

    return (
        <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10 pb-32">
            <div>Link your Google account</div>
            <Button
                className={
                    "inline-flex items-center gap-2 w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                }
                onClick={() => handleSocialClick("google")}
            >
                <BsGoogle />
                Google
            </Button>
        </div>
    );
};

export default AccountSettings;
