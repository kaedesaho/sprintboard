import { createContext, useContext, useState } from "react";

const AuthContext = createContext<{
    isLoggedIn: boolean;
    username: string | null;
    login: (username: string) => void;
    logout: () => void;
}>({
    isLoggedIn: false,
    username: null,
    login: () => {},
    logout: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem("isLoggedIn") === "true"
    );
    const [username, setUsername] = useState(localStorage.getItem("username")); 

    const login = (username: string) => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        setIsLoggedIn(true);
        setUsername(username);
    };

    const logout = () => {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

