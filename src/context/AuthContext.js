import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // helpful to update the UI accordingly

    // check for user in local storage on load
    useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
        const authToken = localStorage.getItem("token");
        if (loggedInUser && authToken) {
            setUser(JSON.parse(loggedInUser));
            setToken(authToken); // Set the token in the state
        }
        setLoading(false);
    }, []);

    // function to save user to local storage and context
    const saveUser = (user, authToken) => {
        // save user to local storage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", authToken); // Save the token to local storage

        // save user to context
        setUser(user);
        setToken(authToken); // Update the token state
    };

    // sign out function
    const signOut = () => {
        // Remove user from local storage
        localStorage.removeItem("user");
        localStorage.removeItem("token"); // Remove the token from local storage

        // Remove user from context
        setUser(null);
        setToken(null); // Clear the token state
    };

    return (
        <AuthContext.Provider
            value={{ user, token, saveUser, loading, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
};
