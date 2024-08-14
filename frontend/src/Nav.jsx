import React from 'react'
import logo from "./Icons/altoslogo.png";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function Nav() {
    const accessToken = Cookies.get("accessToken") || "";
    const is_distributor =
        accessToken && jwtDecode(accessToken).user_is_distributor;
    const is_staff = accessToken && jwtDecode(accessToken).user_is_staff;
    const navigate = useNavigate();
    const handleNewsletter = () => {
        navigate("/newsletter")

    }

    return (
        <div className="bg-[#083929] text-[#f0f0f0] flex justify-between px-16 py-4 max-sm:px-2 max-sm:text-sm">
            <div className=" px-5 w-[250px]">
                <img src={logo} alt="" className="w-full" />
            </div>
            <div className="flex items-center gap-6 text-sm font-medium max-sm:text-xs max-sm:gap-0">
                <div>
                    <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg" onClick={handleNewsletter}>
                        Newsletter
                    </button>
                </div>
                <div>
                    <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg" onClick={() => { navigate("/blog") }}>
                        Blog
                    </button>
                </div>
                <div>
                    <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg">
                        <a href="#contact">Contact Us</a>
                    </button>
                </div>
                <div>
                    {accessToken && (
                        <a
                            href={
                                is_staff
                                    ? "/admin/messages"
                                    : is_distributor
                                        ? "/distributor/users"
                                        : "/messages"
                            }
                        >
                            <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg">
                                Go to Module
                            </button>
                        </a>
                    )}

                    {!accessToken && (
                        <a href="/login">
                            <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg">
                                Login | SignUp
                            </button>
                        </a>
                    )}
                </div>
            </div>
        </div>

    )
}

export default Nav