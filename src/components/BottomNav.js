import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaMagnifyingGlass, FaHouse, FaInbox, FaUser } from "react-icons/fa6";

const BottomNav = () => {
    const router = useRouter();

    // function to select nav link styles based on router path
    const _navStylesHelper = (routes) => {
        if (routes.includes(router.asPath)) {
            return "text-[#61C0BF] text-lg flex flex-col justify-center w-full items-center";
        } else {
            return "text-gray-400 text-lg flex flex-col justify-center w-full items-center";
        }
    };

    // NB: Think we'll likely have to change the navstyleshelper function to work with dynamic routes
    // not sure how exaclty yet but will cross that bridge when we get there
    return (
        <footer className="fixed bottom-0 z-50 w-full">
            <div className="flex items-center justify-around py-4 rounded-t-lg bg-white shadow-[0px_0px_5px_1px] space-x-4">
                <Link href="/" className={_navStylesHelper("/")}>
                    <FaMagnifyingGlass className="text-xl" />
                    <span>Explore</span>
                </Link>
                <Link href="/sublets" className={_navStylesHelper(["/sublets", "/host/sublets"])}>
                    <FaHouse className="text-xl" />
                    <span>Sublets</span>
                </Link>
                <Link href="/inbox" className={_navStylesHelper(["/inbox"])}>
                    <FaInbox className="text-xl" />
                    <span>Inbox</span>
                </Link>
                <Link href="/profile" className={_navStylesHelper(["/profile"])}>
                    <FaUser className="text-xl" />
                    <span>Profile</span>
                </Link>
            </div>
        </footer>
    );
};

export default BottomNav;
