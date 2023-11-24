import React from "react";
import Link from "next/link";
import BottomNav from "./BottomNav";

const GuestPage = ({ contentToView }) => {
    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10">
                <h1 className="font-bold text-3xl">Guest</h1>
                {contentToView ? (
                    <p className="text-lg text-slate-500">
                        You are not logged in. Please sign in or sign up to view your{" "}
                        {contentToView}.
                    </p>
                ) : (
                    <p className="text-lg text-slate-500">
                        You are not logged in. Please sign in or sign up to access this page.
                    </p>
                )}
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
            <BottomNav />
        </>
    );
};

export default GuestPage;
