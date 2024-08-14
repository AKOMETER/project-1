import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const DistributorRoutes = () => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken === '') {
        return <Navigate to="/" />;
    }
    const is_staff = jwtDecode(accessToken).user_is_distributor

    return (
        is_staff ? <Outlet /> : <Navigate to="/" />
    )
}

export default DistributorRoutes