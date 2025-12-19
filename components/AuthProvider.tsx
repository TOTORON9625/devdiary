'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
    password: string;
}

export function AuthProvider({ children, password }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // ローカルストレージから認証状態を復元
        const stored = localStorage.getItem('diary_auth');
        if (stored === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (inputPassword: string): boolean => {
        if (inputPassword === password) {
            setIsAuthenticated(true);
            localStorage.setItem('diary_auth', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('diary_auth');
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
