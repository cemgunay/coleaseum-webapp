import React from "react";
import { FaUser } from "react-icons/fa6";

const ProfileImagePlaceholder = () => {
    return (
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-slate-300">
            <FaUser className="text-4xl text-white" />
        </div>
    );
};

export default ProfileImagePlaceholder;
