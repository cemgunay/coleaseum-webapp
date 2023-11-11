import React from "react";
import Link from "next/link";
import { AiFillHome, AiOutlineInbox, AiFillProfile, AiOutlineSearch } from "react-icons/ai";

const BottomBar = () => {
    return (
        <footer className="fixed bottom-0 w-full">
            <div className="flex items-center justify-center h-16 rounded-t-lg bg-white shadow-[0px_0px_5px_1px] space-x-4">
                <Link href="/explore" className="text-blue-500 flex items-center space-x-2">
                    <AiOutlineSearch />
                    <span>Explore</span>
                </Link>
                <Link href="/sublets" className="text-blue-500 flex items-center space-x-2">
                    <AiFillHome />
                    <span>Sublets</span>
                </Link>
                <Link href="/inbox" className="text-blue-500 flex items-center space-x-2">
                    <AiOutlineInbox />
                    <span>Inbox</span>
                </Link>
                <Link href="/profile" className="text-blue-500 flex items-center space-x-2">
                    <AiFillProfile />
                    <span>Profile</span>
                </Link>
            </div>
        </footer>
    );
};

export default BottomBar;
