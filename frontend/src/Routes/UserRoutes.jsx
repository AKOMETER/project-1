import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const UserRoutes = () => {
    const accessToken = Cookies.get("accessToken");
    const is_staff = jwtDecode(accessToken).user_is_staff

    return (
        is_staff ? <Outlet /> : <Navigate to="/" />
    )
}

export default UserRoutes