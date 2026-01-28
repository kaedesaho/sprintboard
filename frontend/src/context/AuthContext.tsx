import { createContext, useContext, useState } from "react";

const AuthContext = createContext<{
    isLoggedIn: boolean;
    username: string | null;
    userID: number | null;
    login: (username: string, userID: number) => void;
    logout: () => void;
}>({
    isLoggedIn: false,
    username: null,
    userID: null,
    login: () => {},
    logout: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem("isLoggedIn") === "true"
    );
    const [username, setUsername] = useState(localStorage.getItem("username")); 
    const [userID, setUserID] = useState<number | null>(
        localStorage.getItem("userID") ? Number(localStorage.getItem("userID")) : null
    )

    const login = (username: string, id: number) => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("userID", id.toString());
        setIsLoggedIn(true);
        setUsername(username);
        setUserID(id);
    };

    const logout = () => {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("username");
        localStorage.removeItem("userID");
        setIsLoggedIn(false);
        setUsername(null);
        setUserID(null)
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, userID, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

