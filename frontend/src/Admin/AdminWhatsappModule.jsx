import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import logo from "../Icons/altoslogo.png"
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import { RiMenuFoldFill, RiMenuUnfoldFill } from "react-icons/ri";

function AdminWhatsappModule(props) {
    const accessToken = Cookies.get("accessToken")
    const [activeComponent, setActiveComponent] = useState(props.select);
    const navigate = useNavigate()
    const user_role = jwtDecode(accessToken).user_is_distributor;
    const [sidebar, setSidebar] = useState(localStorage.getItem('sidebar') === "true")


    const handleLinkClick = (componentName) => {
        setActiveComponent(componentName);
    };


    const Logout = () => {
        Cookies.remove("accessToken")
        navigate('/')
        // window.location.href = "/"

    }
    const SIdeBar = () => {
        setSidebar(!sidebar)
        localStorage.setItem('sidebar', !sidebar)

    }

    useEffect(() => {
        window.addEventListener("resize", function () {


            if (window.innerWidth <= '700' && sidebar === true) {
                setSidebar(false)
            } else {
                setSidebar(true)
            }
            localStorage.setItem("sidebar", false);
        });
    }, []);

    return (
        <div className='flex h-full'>
            <div className={sidebar ? 'sidebar ' : 'sidebar sidebar-close'}>
                <Link to="/" className=' px-5 w-[250px]'>
                    <img src={logo} alt="" className='w-full' />
                </Link>
                <ul className="space-y-2 text-base font-thin pt-8 select-none">
                    <li onClick={() => handleLinkClick('admin_message')} >
                        <Link to="/admin/messages" className={activeComponent === 'admin_message' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : "whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Dashboard</span>
                        </Link>
                    </li>
                    <li onClick={() => handleLinkClick('admin_users')} >
                        <Link to="/admin/distributors" className={activeComponent === 'admin_distributors' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : "whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Distributors</span>
                        </Link>
                    </li>
                    <li onClick={() => handleLinkClick('admin_users')} >
                        <Link to="/admin/users" className={activeComponent === 'admin_users' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : "whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Clients</span>
                        </Link>
                    </li>
                    <li onClick={() => handleLinkClick('admin_messages')}>
                        <Link to="/admin/contact" className={activeComponent === 'admin_messages' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Enquiries</span>
                        </Link>
                    </li>
                    <li onClick={() => handleLinkClick('admin_purchases')}>
                        <Link to="/admin/purchases" className={activeComponent === 'admin_purchases' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Purchases</span>
                        </Link>
                    </li>
                    <li onClick={() => handleLinkClick('admin_purchases')}>
                        <Link to="/admin/blog" className={activeComponent === 'admin_blog' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Blog</span>
                        </Link>
                    </li>
                    {/* 
                <li onClick={() => handleLinkClick('template')}>
                    <Link to="/template" className={activeComponent === 'template' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                        <span className='px-10'>Templates</span>
                    </Link>
                </li>
                {user_role == true &&
                    <li onClick={() => handleLinkClick('users')}>
                        <Link to="/users" className={activeComponent === 'users' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Users</span>
                        </Link>
                    </li>
                }

                <li onClick={() => handleLinkClick('manage')}>
                    <Link to="/manage" className={activeComponent === 'manage' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                        <span className='px-10'>Manage</span>
                    </Link>
                </li> */}
                    <li onClick={Logout}>
                        <Link to="#" className={activeComponent === 'logout' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Logout</span>
                        </Link>
                    </li>

                </ul>
            </div>
            <div className={sidebar ? 'transition-all ease-in duration-300 h-fit hover:bg-[#064A42] cursor-pointer' : 'transition-all ease-in duration-300 -ml-[240px] h-fit hover:bg-[#064A42] cursor-pointer'} onClick={SIdeBar}>    <span className='text-5xl text-[#064A42]  hover:text-white'>{sidebar ? <RiMenuFoldFill /> : <RiMenuUnfoldFill />}</span></div>
        </div>
    )
}

export default AdminWhatsappModule