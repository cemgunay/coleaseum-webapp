import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Skeleton from "@/components/Skeleton";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import ProfileImagePlaceholder from "@/components/ProfileImagePlaceholder";
import { cn } from "@/utils/utils";
import { FaRegUser } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { PiHouse } from "react-icons/pi";
import { GoArrowSwitch } from "react-icons/go";
import GuestPage from "@/components/GuestPage";

const profile = () => {
    // get user object from context
    // will only contain ID. this is for security reasons
    // we will use this ID to fetch the rest of their info from the db
    const { user: contextUser, loading: contextLoading, signOut } = useAuth();

    // state for user object that will be fetched from db
    const [user, setUser] = useState(null);

    // other state
    const [error, setError] = useState(null);
    const [loadingUserInfo, setLoadingUserInfo] = useState(false);

    // fetch user data if user is logged in (i.e. contextUser is not null)
    useEffect(() => {
        // do nothing if user is not logged in
        if (!contextUser) return;

        // fetch user
        const fetchUser = async () => {
            setLoadingUserInfo(true);
            try {
                const response = await fetch(`/api/users/${contextUser?.id}`);
                if (!response.ok) {
                    const error = await response.json().error;
                    setError(`Error ${response.status}: ${error}`);
                    setLoadingUserInfo(false);
                    return;
                }
                const data = await response.json();
                setUser(data);
                // console.log(data);
            } catch (error) {
                setError(error.message ? error.message : error);
            } finally {
                setLoadingUserInfo(false);
            }
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

    if (contextLoading || loadingUserInfo) {
        return (
            <>
                <Loading />
                <BottomNav />
            </>
        );
    }

    return (
        <>
            {contextUser ? (
                <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10 pb-32">
                    {/* display error if there is one */}
                    {error && (
                        <div className="w-full p-4 -mb-3 -mt-5 text-center text-lg text-red-500">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* display profile img and welcome message/email */}
                    {/* (subject to change, just placeholders for now) */}
                    <div className="flex items-center gap-6">
                        {user?.profileImage ? (
                            <img src={user.profileImage} className="h-20 w-20 rounded-full" />
                        ) : (
                            <ProfileImagePlaceholder />
                        )}
                        <div className="flex flex-col gap-3 items-start justify-center">
                            <h1>Welcome, {user?.firstName}!</h1>
                            <p>Email: {user?.email}</p>
                        </div>
                    </div>

                    {/* content */}
                    <div className="w-full flex flex-col gap-1">
                        {/* account links */}
                        <div className="flex flex-col border-y border-slate-200 py-2">
                            <h2 className="text-2xl font-bold mb-1">Account</h2>
                            <div className="flex flex-col">
                                {/* will prob replace these divs with Links later */}
                                <div
                                    className={cn(
                                        "text-base hover:bg-slate-100 hover:rounded-sm py-2 px-2 transition-all",
                                        "flex items-center gap-2"
                                    )}
                                >
                                    <FaRegUser className="text-lg" />
                                    Personal Info
                                </div>
                                <div
                                    className={cn(
                                        "text-base hover:bg-slate-100 hover:rounded-sm py-2 px-2 transition-all",
                                        "flex items-center gap-2"
                                    )}
                                >
                                    <IoSettingsOutline className="text-lg" />
                                    Account Settings
                                </div>
                            </div>
                        </div>
                        {/* tenant links */}
                        <div className="flex flex-col border-b border-slate-200 py-2">
                            <h2 className="text-2xl font-bold mb-1">Tenant</h2>
                            <div className="flex flex-col">
                                {/* will prob replace these divs with Links later */}
                                <div
                                    className={cn(
                                        "text-base hover:bg-slate-100 hover:rounded-sm py-2 px-2 transition-all",
                                        "flex items-center gap-2"
                                    )}
                                >
                                    <PiHouse className="text-lg" />
                                    List a sublet
                                </div>
                                <div
                                    className={cn(
                                        "text-base hover:bg-slate-100 hover:rounded-sm py-2 px-2 transition-all",
                                        "flex items-center gap-2"
                                    )}
                                >
                                    <GoArrowSwitch className="text-lg" />
                                    Switch to hosting
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* sign out button */}
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
                <GuestPage contentToView="profile" />
            )}
            <BottomNav />
        </>
    );
};

export default profile;
