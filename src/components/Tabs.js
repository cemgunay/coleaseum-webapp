import React, { useState } from "react";
import { cn, capitalizeFirstLetter } from "@/utils/utils";

// A general tabs component
// Takes an array of tab options as all lowercase strings
// Also takes a "setActiveTab" function as a prop, since the parent component
// will need a way to update its own state based on which tab is active
// Also takes an optional "defaultTab" prop, which is the tab that will be
// active by default. If not passed, the first tab will be active by default.

const Tabs = ({ tabList, setActiveTab, defaultTab = null }) => {
    // Local state to handle which tab is currently active
    const [activeTab, setActiveTabState] = useState(defaultTab || tabList[0]);

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

    // if there's more than 6 tabs, don't render anything
    // bc the way I'm setting widths rn won't work for more than 6 tabs
    // ideally, we'd have a dropdown menu for the extra tabs but I think that's too complex for rn
    if (tabList.length > 6) {
        return null;
    }

    return (
        <div className="flex w-full p-1 mb-3 rounded-sm bg-slate-100 space-x-1">
            {tabList.map((tab) => (
                <div
                    key={tab}
                    className={cn(
                        "flex items-center text-base justify-center rounded-sm",
                        `w-1/${tabList.length}`,
                        tabClass(tab)
                    )}
                    onClick={() => handleTabClick(tab)}
                >
                    {capitalizeFirstLetter(tab)}
                </div>
            ))}
        </div>
    );
};

export default Tabs;
