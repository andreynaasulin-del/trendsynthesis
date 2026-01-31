"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ru";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
    en: {
        dashboard: "Dashboard",
        generate: "Generate",
        projects: "Projects",
        settings: "Settings",
        signOut: "Sign Out",
    },
    ru: {
        dashboard: "Дашборд",
        generate: "Генератор",
        projects: "Проекты",
        settings: "Настройки",
        signOut: "Выйти",
    },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    useEffect(() => {
        const stored = localStorage.getItem("trendsynth-lang") as Language;
        if (stored && (stored === "en" || stored === "ru")) {
            setLanguage(stored);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("trendsynth-lang", lang);
    };

    const t = (key: string) => {
        // @ts-ignore
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
