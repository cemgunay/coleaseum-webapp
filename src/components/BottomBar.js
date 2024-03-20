import React from "react";

const BottomBar = ({ children }) => {
    return (
        <footer className="fixed bottom-0 w-full">
            <div className="flex items-center justify-around py-6 rounded-t-lg bg-white shadow-[0px_0px_5px_1px] space-x-4">
                {children}
            </div>
        </footer>
    );
};

export default BottomBar;
