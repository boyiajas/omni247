import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import translate from '../i18n';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [language, setLanguageState] = useState(user?.language || 'en');

    useEffect(() => {
        if (user?.language && user.language !== language) {
            setLanguageState(user.language);
        }
    }, [user?.language, language]);

    const setLanguage = (nextLanguage) => {
        setLanguageState(nextLanguage);
        if (user) {
            updateUser({ language: nextLanguage });
        }
    };

    const t = useMemo(() => {
        return (key, params) => translate(key, language, params);
    }, [language]);

    const value = {
        language,
        setLanguage,
        t,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
