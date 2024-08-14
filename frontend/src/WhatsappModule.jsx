import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import logo from "./Icons/altoslogo.png"
import AddCredentials from "./Error/AddCredentials.jsx"
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import config from './config';
import axios from 'axios';
import { RiMenuFoldFill, RiMenuUnfoldFill } from "react-icons/ri";
import { IoMdNotifications } from "react-icons/io";

function WhatsappModule(props) {
    const accessToken = Cookies.get("accessToken")
    const [activeComponent, setActiveComponent] = useState(props.select);
    const navigate = useNavigate()
    const userid = jwtDecode(accessToken).user_id;
    const [errorManage, setErrorManage] = useState()
    const [phonenumberId, setPhonenumberId] = useState()
    const [appid1, setAppid] = useState()

    const [access, setAccess] = useState()
    const [businessId, setBusinessId] = useState()
    const [notifications, setnotifications] = useState()
    const [notdata, setnotdata] = useState()
    const handleLinkClick = (componentName) => {
        setActiveComponent(componentName);
    };

    const [sidebar, setSidebar] = useState(localStorage.getItem('sidebar') === "true")

    const SIdeBar = () => {
        setSidebar(!sidebar)
        localStorage.setItem('sidebar', !sidebar)

    }







    useEffect(() => {
        window.addEventListener("resize", function () {
            if (window.innerWidth <= '700') {
                setSidebar(false)
            } else {
                setSidebar(true)
            }
            localStorage.setItem("sidebar", false);
        });
    }, []);
    const Logout = () => {
        Cookies.remove("accessToken")
        Cookies.remove("isManager")
        localStorage.removeItem("lastFetchTime")
        navigate("/")
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }

    function CredValidate() {
        axios.get(`${config.baseUrl}validate/credentials?user_id=${userid}`, { headers: headers })
            .then((response) => {

                // setTemplateData(response.data.data)
            })
            .catch((error) => {

                setErrorManage(true)
                if (error.response.data.access === "added-not-valid") {
                    setBusinessId(error.response.data.message.business_id)
                    setPhonenumberId(error.response.data.message.phone_number_id)
                    setAppid(error.response.data.message.app_id)

                    setAccess(error.response.data.access)
                    setSidebar(true)
                } else {
                    setAccess(error.response.data.access)
                    setSidebar(true)
                }

            })
    }

    function CheckNotifications() {
        axios
            .get(`${config.baseUrl}check/notifications/?userid=${userid}`, { headers: headers })
            .then((response) => {

                setnotifications(response.data.unread)



            })
            .catch((error) => {


            });
    }
    useEffect(() => {
        CheckToken();
        CheckNotifications()
        CredValidate()
        // if (access) {
        //     setSidebar(true)
        //     localStorage.setItem('sidebar', true)

        // }

    }, [])
    function CheckToken() {
        if (!accessToken) {
            navigate("/");
        }

        try {
            const decodedToken = jwtDecode(accessToken);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                Cookies.remove('accessToken');
                navigate("/");
            } else {

            }
        } catch (error) {
            // console.error('Invalid token', error);
            Cookies.remove('accessToken');
            navigate("/");
        }
    }




    return (
        <div className='flex h-full'>
            <div className={sidebar ? 'sidebar ' : 'sidebar sidebar-close'}>
                <div className='relative'>

                    <Link to="/" className=' px-5 '>

                        <img src={logo} alt="" className='object-contain w-full' />
                    </Link>

                </div>
                <ul className="space-y-2 text-base font-thin pt-8 select-none">
                    <li onClick={() => handleLinkClick('sent-message')} >
                        <Link to="/messages" className={activeComponent === 'sent-message' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : "whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Send Messages</span>
                        </Link>
                    </li>

                    <li onClick={() => handleLinkClick('upload')}>
                        <Link to="/upload" className={activeComponent === 'upload' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Upload</span>
                        </Link>
                    </li>

                    <li onClick={() => handleLinkClick('template')}>
                        <Link to="/template" className={activeComponent === 'template' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Templates</span>
                        </Link>
                    </li>
                    <li onClick={() => handleLinkClick('templateanalytics')}>
                        <Link to="/template/analytics" className={activeComponent === 'templateanalytics' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Template Analytics</span>
                        </Link>
                    </li>

                    <li onClick={() => handleLinkClick('contacts')}>
                        <Link to="/contacts" className={activeComponent === 'contacts' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span class="px-10">Contacts</span>
                        </Link>
                    </li>

                    <li onClick={() => handleLinkClick('manage')}>
                        <Link to="/manage" className={activeComponent === 'manage' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span class="px-10">Manage</span>
                        </Link>
                    </li>
                    <li onClick={() => handleLinkClick('notifications')}>
                        <Link to="/notifications" className={activeComponent === 'notifications' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10 relative'>Notifications   {notifications && notifications.length >= 1 && <span class="absolute top-0 right-0 bg-[#ECE5DD] text-[#064A42] rounded-full px-2 py-1 text-xs">
                                <div>{notifications.length}</div>
                            </span>}
                            </span>
                            {/* {props.notificationlength} */}
                        </Link>
                    </li>
                    <li onClick={Logout}>
                        <Link to="/" className={activeComponent === 'logout' ? "text-[#064A42] bg-[#ECE5DD] flex items-center space-x-3 p-2 whitespace-nowrap" : " whitespace-nowrap flex items-center space-x-3 p-2 text-white  rounded-md font-thin hover:bg-[#ECE5DD] hover:text-[#064A42]"}>
                            <span className='px-10'>Logout</span>
                        </Link>
                    </li>

                </ul>
                {errorManage && <div className=' absolute z-50 w-full h-full top-0 left-0 flex justify-center items-center bg-black/40'>
                    <AddCredentials businessId={businessId} phonenumberId={phonenumberId} access={access} appid1={appid1} setErrorManage={setErrorManage} />
                </div>}
            </div>
            <div className={sidebar ? 'transition-all ease-in duration-300 h-fit hover:bg-[#064A42] cursor-pointer' : 'transition-all ease-in duration-300 -ml-[240px] h-fit hover:bg-[#064A42] cursor-pointer'} onClick={SIdeBar}>    <span className='text-5xl text-[#064A42]  hover:text-white'>{sidebar ? <RiMenuFoldFill /> : <RiMenuUnfoldFill />}</span></div>
        </div >
    )
}

export default WhatsappModule