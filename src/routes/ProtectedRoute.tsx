import { useAuth } from "@/context/AuthContext";
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";


interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children, allowedRoles}) => {
    const {user, loading} = useAuth();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const location = useLocation();

    const from = `${location.pathname}${location.search}`;

    // no token at all -> redirect to login
    if (!token) {
        return <Navigate to="/login" replace state={{ toastMessage: "You must be authorized to visit this page", from }} />;
    }

    if (loading) return null;

    if(!user){
        return <Navigate to="/login" replace state={{ toastMessage: "You must be authorized to visit this page", from }} />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)){
        return <Navigate to="/" replace state={{ toastMessage: "You don\'t have permission to visit this page! "}} />
    }

    return <>{children}</>
}

export default ProtectedRoute;
