import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
    username: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('pms_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const isAuthenticated = !!user;

    const login = async (username: string, password: string) => {
        const res = await apiClient.login(username, password);
        if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('pms_user', JSON.stringify(res.user));
            if (res.token) {
                localStorage.setItem('pms_token', res.token);
            }
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pms_user');
        localStorage.removeItem('pms_token');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
