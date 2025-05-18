import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

// Export AuthContext
export const AuthContext = createContext({
    auth: null,
    setAuth: () => { },
    login: () => { },
    logout: () => { },
    getUserId: () => null
});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        try {
            const savedAuth = Cookies.get("auth");
            return savedAuth ? JSON.parse(savedAuth) : null;
        } catch (error) {
            console.error('Error parsing auth cookie:', error);
            return null;
        }
    });

    const getUserId = () => {
        try {
            return auth?.userId || null;
        } catch (error) {
            console.error('Error getting userId:', error);
            return null;
        }
    };

    const getEmail = () => {
        try {
            return auth?.email || null;
        } catch (error) {
            console.error('Error getting email:', error);
            return null;
        }
    };

    const login = (email, userId) => {
        try {
            const authData = {
                email,
                userId
            };
            setAuth(authData);
            Cookies.set("auth", JSON.stringify(authData));
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const logout = () => {
        try {
            Cookies.remove("auth");
            setAuth(null);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    useEffect(() => {
        if (!auth) {
            Cookies.remove("auth");
        }
    }, [auth]);

    const value = {
        auth,
        setAuth,
        login,
        logout,
        getUserId,
        getEmail
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};