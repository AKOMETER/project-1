import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";


const PrivateRoutes = () => {

    const accessToken = Cookies.get("accessToken") || '';
    if (accessToken === '') {
        return <Navigate to="/" />;
    }
    const is_staff = jwtDecode(accessToken).user_is_staff
    const is_distributor = jwtDecode(accessToken).user_is_distributor

    return (
        is_staff === false ? <Outlet /> : <Navigate to="/" />
    )
}

export default PrivateRoutes