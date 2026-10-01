import { createContext, useContext } from "react";
import { useTheme } from "../hooks/useTheme";

type Theme = "dark" | "light";

interface ThemeContextValue {
    theme: Theme;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "dark",
    toggle: () => {}
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { theme, toggle } = useTheme();
    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(ThemeContext);
