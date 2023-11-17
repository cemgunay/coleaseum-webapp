import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // helpful to update the UI accordingly

    // check for user in local storage on load
    useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
        setLoading(false);
    }, []);

    // function to save user to local storage and context
    const saveUser = (user) => {
        // save user to local storage
        localStorage.setItem("user", JSON.stringify(user));

        // save user to context
        setUser(user);
    };

    // sign out function
    const signOut = () => {
        // Remove user from local storage
        localStorage.removeItem("user");

        // Remove user from context
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, saveUser, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
