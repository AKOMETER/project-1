import React, { useEffect, useState } from 'react'
import { AiOutlineInfoCircle } from 'react-icons/ai';
import Cookies from "js-cookie";
import axios from 'axios';
import config from '../config';
import WhatsappModule from '../WhatsappModule';
import { jwtDecode } from 'jwt-decode';
import { GoRead, GoTrash } from "react-icons/go";


function Notifications() {
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;
    const [loading, setloading] = useState(false)
    const [notificationsread, setNotificationsRead] = useState()
    const [notificationsunread, setNotificationsUnread] = useState()
    const [showButtons, setShowButtons] = useState(false);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
    function CheckNotifications() {
        axios
            .get(`${config.baseUrl}check/notifications/?userid=${userid}`, { headers: headers })
            .then((response) => {

                setNotificationsRead(response.data.read)
                setNotificationsUnread(response.data.unread)



            })
            .catch((error) => {


            });
    }
    function MarkasRead(id) {
        axios
            .post(`${config.baseUrl}notifications/${id}/`)
            .then((response) => {

                CheckNotifications()
            })
            .catch((error) => {


            });
    }

    function DeleteNotifications(id) {
        axios
            .delete(`${config.baseUrl}notifications/${id}/`)
            .then((response) => {

                CheckNotifications()
            })
            .catch((error) => {


            });
    }

    useEffect(() => {
        CheckNotifications()


    }, [])



    return (
        <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
            <div className='h-full'>
                <WhatsappModule select={"notifications"} />
            </div>
            <div className='p-5 flex-1'>
                <div className=' text-[#0d291a] text-4xl font-bold select-none'>Notifications</div>
                <div className='flex flex-col mt-6 gap-3'>
                    <div className='text-lg bg-[#0d291a] text-white px-2 py-1 rounded-lg'>Un-Read Notifications</div>
                    {notificationsunread && notificationsunread.map((data) => (
                        <div className="purple_border px-8 py-3 border border-black max-sm:text-xs flex justify-between items-center group">
                            {data.notification}{notificationsunread.length}
                            <div className="flex mt-2 invisible group-hover:visible">
                                <button className="bg-[#153c27] hover:bg-[#0c2015] text-white font-bold py-2 px-4 rounded" onClick={() => { MarkasRead(data.id) }}><GoRead /></button>
                                <button className="bg-[#153c27] hover:bg-[#0c2015] text-white font-bold py-2 px-4 rounded ml-2" onClick={() => { DeleteNotifications(data.id) }}><GoTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='flex flex-col mt-6 gap-3 opacity-70'>
                    <div className='text-lg bg-[#0d291a] text-white px-2 py-1 rounded-lg'>Read Notifications</div>
                    {notificationsread && notificationsread.map((data) => (
                        <div className="purple_border px-8 py-3 border border-black max-sm:text-xs flex justify-between items-center group">
                            {data.notification}
                            <div className="flex mt-2 invisible group-hover:visible">
                                <button className="bg-[#153c27] hover:bg-[#0c2015] text-white font-bold py-2 px-4 rounded" onClick={() => { MarkasRead(data.id) }}><GoRead /></button>
                                <button className="bg-[#153c27] hover:bg-[#0c2015] text-white font-bold py-2 px-4 rounded ml-2" onClick={() => { DeleteNotifications(data.id) }}><GoTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {
                loading && <div className=' absolute w-full h-full top-0 flex justify-center items-center bg-black/40'>
                    <svg className='animate-spin' width="100px" height="100px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z" fill='#ffffff' />
                        </g>
                    </svg>
                </div>
            }
        </div >
    )
}

export default Notifications