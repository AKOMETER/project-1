import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import logo from "../Icons/altoslogo.png"
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';


function DistributorWhatsappModule(props) {
    const accessToken = Cookies.get("accessToken")
    const [activeComponent, setActiveComponent] = useState(props.select);
    const navigate = useNavigate()
    const user_role = jwtDecode(accessToken).user_is_distributor;


    const handleLinkClick = (componentName) => {
        setActiveComponent(componentName);
    };


    const Logout = () => {
        Cookies.remove("accessToken")
        navigate('/')
        // window.location.href = "/"

    }

    return (
        <div className='bg-[#064A42] pt-5  rounded-s-2xl h-full w-[250px]'>
            <Link to="/" className=' px-5 w-[50px]'>
                <img src={logo} alt="" className='w-full' />
            </Link>
            <ul className="space-y-2 text-base font-thin pt-8 select-none">
                {/* <li onClick={() => handleLinkClick('admin_message')} >
                    <Link to="/distributor" className={activeComponent === 'distributor_message' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : "whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                        <span className='px-10'>Dashboard</span>
                    </Link>
                </li> */}
                <li onClick={() => handleLinkClick('admin_users')} >
                    <Link to="/distributor/users" className={activeComponent === 'distributor_users' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : "whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                        <span className='px-10'>Users</span>
                    </Link>
                </li>
                {/* <li onClick={() => handleLinkClick('upload')}>
                    <Link to="/upload" className={activeComponent === 'upload' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                        <span className='px-10'>Upload</span>
                    </Link>
                </li>
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
    )
}

export default DistributorWhatsappModule