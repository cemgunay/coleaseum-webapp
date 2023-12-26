import React, { useState, useEffect } from "react";
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
import { signOut } from "next-auth/react";
import getLoggedInUserDetails from "@/utils/getLoggedInUserDetails";
import RadialProgress from "@/components/ui/RadialProgress";
import { useRouter } from "next/router";

const profile = () => {
    // get user object from context
    // will only contain ID. this is for security reasons
    // we will use this ID to fetch the rest of their info from the db
    const { user: contextUser, status } = useAuth();

    const router = useRouter();

    // state for user object that will be fetched from db
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (user && !user.firstName && !user.lastName && user.name) {
            const nameParts = user.name.split(" ");
            // Create a new object with updated fields
            const updatedUser = {
                ...user,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(" "),
            };

            // Set the new user object
            setUser(updatedUser);
        }
    }, [user]);

    // other state
    const [error, setError] = useState(null);
    const [loadingUserInfo, setLoadingUserInfo] = useState(false);

    //calculate profile completion
    const calculateProfileCompletion = (user) => {
        const requiredFields = [
            "firstName",
            "lastName",
            "dateOfBirth",
            "location",
            "email",
        ];
        let completedFields = 0;

        requiredFields.forEach((field) => {
            if (user && user[field]) {
                completedFields += 1;
            }
        });

        //if the name is in database give an extra 2 points so that user doesnt get discouraged from radial progress showing very little
        if (user && user["name"] && !user["firstName"] && !user["lastName"]) {
            completedFields += 2;
        }

        return (completedFields / requiredFields.length) * 100;
    };

    // fetch user data if user is logged in (i.e. contextUser is not null)
    useEffect(() => {
        if (!contextUser) return;

        const fetchUser = async () => {
            setLoadingUserInfo(true);
            try {
                const fetchedUser = await getLoggedInUserDetails(
                    contextUser,
                    status,
                    setError,
                    setLoadingUserInfo
                );
                if (fetchedUser) {
                    setUser(fetchedUser);
                }
            } catch (error) {
                // Handle any additional error logic here, if needed
                console.error("Error fetching user details:", error);
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

    if (status === "loading" || loadingUserInfo) {
        return (
            <>
                <Loading />
                <BottomNav />
            </>
        );
    }

    const ProfileCompletion = ({ user }) => {
        const completionPercentage = calculateProfileCompletion(user);

        console.log(completionPercentage);

        return (
            <>
                {completionPercentage !== 100 ? (
                    <div className="border border-slate-200 rounded-lg p-4 mb-4">
                        <div className="text-lg mb-2">
                            Complete Your Profile
                        </div>
                        <div className="flex justify-between items-center">
                            <div>Reach 100% to access all feautres</div>
                            <RadialProgress progress={completionPercentage} />
                        </div>

                        <Button
                            className="mt-3"
                            variant="outline"
                            // Add onClick to navigate to the profile edit page
                            onClick={() => {
                                /* Navigate to profile edit page */
                                router.push("/profile/edit");
                            }}
                        >
                            Complete Profile
                        </Button>
                    </div>
                ) : null}
            </>
        );
    };

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
                        {user?.image ? (
                            <img
                                src={user.image}
                                className="w-20 h-20 rounded-full"
                            />
                        ) : (
                            <ProfileImagePlaceholder />
                        )}
                        <div className="flex flex-col gap-3 items-start justify-center">
                            <h1 className="text-xl font-bold">
                                Welcome, {user?.firstName}!
                            </h1>
                        </div>
                    </div>

                    {/* content */}
                    <div className="w-full flex flex-col gap-1">
                        <ProfileCompletion user={user} />
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
                                <div
                                    className={cn(
                                        "text-base hover:bg-slate-100 hover:rounded-sm py-2 px-2 transition-all",
                                        "flex items-center gap-2"
                                    )}
                                >
                                    <IoSettingsOutline className="text-lg" />
                                    Account Linking
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
                        onClick={() => signOut()}
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
