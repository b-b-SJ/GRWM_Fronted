// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // hash에 token이 있으면 처리 시간 대기
        const hash = window.location.hash;
        if (hash && hash.includes('token=')) {
            setTimeout(() => setIsChecking(false), 200);
        } else {
            setIsChecking(false);
        }
    }, []);

    if (isChecking) return <div>로딩중...</div>;

    return isAuthenticated ? children : <Navigate to="/auth" replace />;
};
export default ProtectedRoute;
