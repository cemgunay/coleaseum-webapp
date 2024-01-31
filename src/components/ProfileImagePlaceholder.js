import React from "react";
import { FaUser } from "react-icons/fa6";
import clsx from "clsx";

const ProfileImagePlaceholder = ({ height = "h-20", width = "w-20", iconSize = "text-4xl" }) => {
    return (
        <div className={clsx("flex items-center justify-center rounded-full bg-slate-300", height, width)}>
            <FaUser className={clsx("text-white", iconSize)} />
        </div>
    );
};

export default ProfileImagePlaceholder;
