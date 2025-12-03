import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken, clearTokens } from '@/lib/api';

interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
    status: string;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (tokenData: any) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const token = getToken();
        if (token) {
            try {
                const userData = await authAPI.getCurrentUser() as User;
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user", error);
                clearTokens();
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (tokenData: any) => {
        checkAuth();
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
