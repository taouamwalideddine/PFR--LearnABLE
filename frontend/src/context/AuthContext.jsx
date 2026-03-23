import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [activeChild, setActiveChild] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const storedChild = localStorage.getItem('activeChild');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        if (storedChild) {
            setActiveChild(JSON.parse(storedChild));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, ...userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        const { token, ...data } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const switchChild = (child) => {
        if (child) {
            localStorage.setItem('activeChild', JSON.stringify(child));
            setActiveChild(child);
        } else {
            localStorage.removeItem('activeChild');
            setActiveChild(null);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeChild');
        setUser(null);
        setActiveChild(null);
    };

    return (
        <AuthContext.Provider value={{ user, activeChild, loading, login, register, logout, switchChild }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
