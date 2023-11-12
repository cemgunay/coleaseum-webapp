import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Skeleton from "@/components/Skeleton";
import BottomNav from "@/components/BottomNav";

const profile = () => {
    // get user object from context
    const { user, loading } = useAuth();

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
                    <>
                        <div className="flex flex-col gap-3 w-full">
                            <Skeleton className="w-1/3 h-6 mb-1" />
                            <Skeleton className="w-1/4 h-5" />
                            <Skeleton className="w-1/2 h-5" />
                            <Skeleton className="w-1/3 h-5" />
                        </div>
                        <div className="h-[1px] bg-slate-200 w-full" />
                    </>
                ))}
            </div>
        );
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            {user ? (
                <div>
                    <h1>Welcome, {user.firstName}!</h1>
                    <p>Email: {user.email}</p>
                    {/* gonna add more user info here and style properly */}
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
