import { createContext, useContext, useState } from "react";

const AuthContext = createContext<{
    isLoggedIn: boolean;
    username: string | null;
    userID: number | null;
    photoUrl: string | null;
    login: (username: string, userID: number, photoUrl?: string | null) => void;
    logout: () => void;
    updatePhoto: (url: string) => void;
}>({
    isLoggedIn: false,
    username: null,
    userID: null,
    photoUrl: null,
    login: () => {},
    logout: () => {},
    updatePhoto: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem("isLoggedIn") === "true"
    );
    const [username, setUsername] = useState(localStorage.getItem("username"));
    const [userID, setUserID] = useState<number | null>(
        localStorage.getItem("userID") ? Number(localStorage.getItem("userID")) : null
    );
    const [photoUrl, setPhotoUrl] = useState<string | null>(
        localStorage.getItem("photoUrl")
    );

    const login = (username: string, id: number, photoUrl?: string | null) => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("userID", id.toString());
        if (photoUrl) {
            localStorage.setItem("photoUrl", photoUrl);
        } else {
            localStorage.removeItem("photoUrl");
        }
        setIsLoggedIn(true);
        setUsername(username);
        setUserID(id);
        setPhotoUrl(photoUrl ?? null);
    };

    const logout = () => {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("username");
        localStorage.removeItem("userID");
        localStorage.removeItem("photoUrl");
        setIsLoggedIn(false);
        setUsername(null);
        setUserID(null);
        setPhotoUrl(null);
    };

    const updatePhoto = (url: string) => {
        localStorage.setItem("photoUrl", url);
        setPhotoUrl(url);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, userID, photoUrl, login, logout, updatePhoto }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
