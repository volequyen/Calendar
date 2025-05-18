import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import Home from "../pages/Home";
import Login from "../pages/login";
import Register from "../pages/register";
import { AuthContext } from "../context/authProvider";

const PrivateRoute = () => {
    const { getUserId } = useContext(AuthContext);
    let userId;
    try {
        userId = getUserId();
        console.log('Current userId:', userId);
    } catch (error) {
        console.error('Error getting userId:', error);
        return <Navigate to="/login" replace />;
    }
    console.log('Current userId:', userId);
    if (!userId) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <PrivateRoute />,
        children: [
            { index: true, element: <Home /> },
        ]
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    }
]);

export default router;