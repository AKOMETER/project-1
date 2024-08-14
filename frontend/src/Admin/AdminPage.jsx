import React, { useEffect, useRef, useState } from 'react'
import AdminWhatsappModule from './AdminWhatsappModule'
import config from '../config'
import axios from 'axios'
import Cookies from "js-cookie";



function AdminPage() {
    const [notification, setNotification] = useState()
    const accessToken = Cookies.get("accessToken")
    const [lendistributor, setLendistributor] = useState()
    const [lenusers, setLenusers] = useState()
    const [userpopup, setUserpopup] = useState()
    const [userchildren, setUserchildren] = useState()
    const notificationref = useRef(null)

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }

    const Getusers = () => {
        axios.get(`${config.baseUrl}users/`, { headers: headers })
            .then((response) => {
                // setuserdata(response.data.distributor_users)
                // setuserdata(response.data.staff_users)
                setLendistributor(response.data.distributor_users.length)
                setLenusers(response.data.staff_users.length)

            })
            .catch((error) => {

            })
    }
    const GetChildrenUsers = (userid) => {
        axios.get(`${config.baseUrl}user-children/${userid}/`, { headers: headers })
            .then((response) => {
                setUserchildren(response.data)

            })
            .catch((error) => {

            })
    }
    const UploadNotifications = () => {
        axios.post(`${config.baseUrl}check/notifications/`, { "message": notificationref.current.value }, { headers: headers })
            .then((response) => {
                setUserchildren(response.data)
                setNotification(false)

            })
            .catch((error) => {

            })
    }
    useEffect(() => {
        Getusers()
    }, [])
    const HandleUserDetails = (userid) => {
        setUserpopup(true)
        GetChildrenUsers(userid)
    }


    const UserDetails = () => {
        // const [active, setactive] = useState()
        const DisableUser = (key, is_active, email) => {

            const data = {
                "is_active": !is_active,
                "email": email
            }

            axios.put(`${config.baseUrl}users/${key}/`, data, { headers: headers })
                .then((response) => {

                    // GetChildrenUsers(key)
                    // setactive(!is_active)
                    // setUserpopup(false);

                })
                .catch((error) => {

                })
        }

        return (
            <div className='absolute w-screen h-screen top-0 left-0 bg-black/10 flex justify-center items-center '
                onClick={() => { setUserpopup(false); }} >
                <div className='bg-white w-10/12 h-[80%] rounded-lg p-4' onClick={(event) => { event.stopPropagation(); }}>
                    <div className='text-2xl font-bold'>User Children Users</div>
                    <div className='text-lg font-bold'> </div>
                    <table className='table-auto w-full'>
                        <tr>
                            <th>Distributor Email</th>
                            <th>Active/Not Active</th>
                        </tr>
                        {userchildren && userchildren.map((user) => (
                            <tr>
                                <td>{user.email}</td>
                                <td>
                                    <label htmlFor={'togglePersonal' + user.id} className="flex items-center justify-center cursor-pointer   p-3 rounded-xl">
                                        {/* <span>Personalised Messaging Feature</span> */}
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                id={'togglePersonal' + user.id}
                                                className="sr-only"
                                                checked={user.is_active}
                                                onChange={() => DisableUser(user.id, user.is_active, user.email)}
                                            />
                                            <div className="block bg-gray-500 w-14 h-8 rounded-full back-check"></div>
                                            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                                        </div>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </table>


                </div>

            </div>
        )
    }


    return (
        <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
            <div className='h-full'>
                <AdminWhatsappModule select={"admin_message"} />
            </div>
            <div className='flex-1 p-5'>
                <div className=' text-3xl font-bold'>DashBoard</div>
                <div className='flex gap-4'>
                    <div className='rounded-lg bg-white shadow-sm max-w-max p-3 mt-4'>
                        <div className='text-xl select-none'>Total No of Distributors</div>
                        <div className=' text-6xl'>{lendistributor && lendistributor} <span className='text-lg'>distributors</span></div>

                    </div>
                    <div className='rounded-lg bg-white shadow-sm max-w-max p-3 mt-4'>
                        <div className='text-xl select-none'>Total No of Users</div>
                        <div className=' text-6xl'>{lenusers && lenusers}<span className='text-lg'>users</span></div>

                    </div>
                </div>

                <div
                    className=' mt-4 select-none cursor-pointer flex justify-center items-center bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold text-xs tracking-widest'
                    onClick={() => { setNotification(true) }}>
                    Create Notification for Users
                </div>
                {notification &&
                    <div className="transition-all ease-in duration-1000 absolute w-full h-full bg-green-950/25 top-0 left-0 flex justify-center items-center " onClick={() => { setNotification(false) }}>
                        <div className='w-3/6 bg-white rounded-lg flex flex-col items-center p-2' onClick={(e) => { e.stopPropagation() }}>
                            <div className=' text-green-800 font-semibold'>
                                Create Notification for All users
                            </div>
                            <label className='flex flex-col mt-2'>Notification Message
                                <input className='lowercase border border-gray-400 rounded-md h-9 px-3' ref={notificationref} />
                            </label>
                            <span className=' bg-[#0d291a] text-white text-xs px-2 py-1 rounded-lg cursor-pointer select-none w-min whitespace-nowrap font-light ' onClick={UploadNotifications} >Create Notification</span>
                        </div>
                    </div>
                }

                {/* <div>
                    <div>Distributors</div>
                    <div className='flex flex-col gap-3'>
                        {userdata && userdata.map((user) => (
                            <div key={user.id} className='bg-white p-2 rounded-sm flex justify-between gap-6 max-w-max'>
                                <div className='font-semibold'>{user.email}</div>
                                <div className='text-sm bg-[#064A42] max-w-max text-white px-2 rounded-md cursor-pointer select-none self-end border border-[#064A42] hover:text-[#064A42] hover:bg-white'
                                    onClick={() => { HandleUserDetails(user.id) }}
                                >see users</div>
                            </div>
                        ))}
                        {userpopup && <div>
                            <UserDetails />
                        </div>
                        }
                    </div>

                </div> */}
            </div>

        </div>
    )
}

export default AdminPage