import React, { useState } from "react";
import { cn } from "@/utils/utils";

const SubletsTabs = ({ setActiveTab }) => {
    // Local state to handle which tab is currently active
    const [activeTab, setActiveTabState] = useState("active");

    // Function to handle tab click
    const handleTabClick = (tab) => {
        setActiveTabState(tab);
        setActiveTab(tab); // Call the function passed as a prop
    };

    // Function to generate CSS classes for the tabs
    const tabClass = (tab) => {
        return `cursor-pointer px-4 py-2 transition-opacity duration-200 ${
            activeTab === tab
                ? "bg-white text-slate-800 shadow-sm opacity-100"
                : "bg-slate-100 text-slate-700 opacity-50"
        }`;
    };

    return (
        <div className="flex w-full p-1 mb-3 rounded-sm bg-slate-100 space-x-1">
            <div
                className={cn(
                    "flex items-center text-base justify-center rounded-sm w-1/3",
                    tabClass("active")
                )}
                onClick={() => handleTabClick("active")}
            >
                Active
            </div>
            <div
                className={cn(
                    "flex items-center text-base justify-center rounded-sm w-1/3",
                    tabClass("past")
                )}
                onClick={() => handleTabClick("past")}
            >
                Past
            </div>
            <div
                className={cn(
                    "flex items-center text-base justify-center rounded-sm w-1/3",
                    tabClass("confirmed")
                )}
                onClick={() => handleTabClick("confirmed")}
            >
                Confirmed
            </div>
        </div>
    );
};

export default SubletsTabs;
