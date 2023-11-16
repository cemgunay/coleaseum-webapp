import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Skeleton from "@/components/Skeleton";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const profile = () => {
    // get user object from context
    // will ONLY contain ID. this is for security reasons
    // we will use this ID to fetch the rest of their info from the db
    const { user: contextUser, loading, signOut } = useAuth();
    console.log(contextUser);

    // state for user object that will be fetched from db
    const [user, setUser] = useState(null);

    // fetch user data if user is logged in (i.e. contextUser is not null)
    useEffect(() => {
        // do nothing if user is not logged in
        if (!contextUser) return;

        // fetch user
        const fetchUser = async () => {
            const response = await fetch(`/api/users/${contextUser?.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user :(");
            }
            const data = await response.json();
            setUser(data);
        };
        fetchUser();
    }, [contextUser]);

    // loading component
    const Loading = () => {
        return (
            <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10">
                <div className="flex items-center gap-5">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-5 w-52" />
                    </div>
                </div>
                <div className="h-[1px] bg-slate-200 w-full" />
                {[...Array(3)].map((_, i) => (
                    <div className="flex flex-col gap-5 w-full" key={i}>
                        <div className="flex flex-col gap-3 w-full">
                            <Skeleton className="w-1/3 h-6 mb-1" />
                            <Skeleton className="w-1/4 h-5" />
                            <Skeleton className="w-1/2 h-5" />
                            <Skeleton className="w-1/3 h-5" />
                        </div>
                        <div className="h-[1px] bg-slate-200 w-full" />
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            {contextUser ? (
                <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10">
                    <h1>Welcome, {user?.firstName}!</h1>
                    <p>Email: {user?.email}</p>
                    <Button
                        variant="outline"
                        size="lg"
                        className="font-normal text-base text-slate-600"
                        onClick={signOut}
                    >
                        Sign Out
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10">
                    <h1 className="font-bold text-3xl">Guest</h1>
                    <p className="text-lg text-slate-500">
                        You are not logged in. Please sign in or sign up to view your profile.
                    </p>
                    <div className="flex items-center gap-5">
                        <Link
                            className="text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md border border-slate-500 text-slate-500 cursor-pointer"
                            href="/auth/signin"
                        >
                            Sign In
                        </Link>
                        <Link
                            className="text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md border bg-black text-white cursor-pointer"
                            href="/auth/signup"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            )}
            <BottomNav />
        </>
    );
};

export default profile;
