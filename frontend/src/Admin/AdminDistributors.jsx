import React, { useEffect, useState } from 'react'
import AdminWhatsappModule from './AdminWhatsappModule'
import config from '../config'
import axios from 'axios'
import Cookies from "js-cookie";



function AdminDistributors() {
    const [userdata, setuserdata] = useState()
    const accessToken = Cookies.get("accessToken")
    const [lendistributor, setLendistributor] = useState()
    const [lenusers, setLenusers] = useState()
    const [userpopup, setUserpopup] = useState()
    const [userchildren, setUserchildren] = useState()

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }

    const Getusers = () => {
        axios.get(`${config.baseUrl}users/`, { headers: headers })
            .then((response) => {
                setuserdata(response.data.distributor_users)
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
                <AdminWhatsappModule select={"admin_distributors"} />
            </div>
            <div className='flex-1 p-5'>
                {/* <div className=' text-3xl font-bold'>DashBoard</div>
                <div className='flex gap-4'>
                    <div className='rounded-lg bg-white shadow-sm max-w-max p-3 mt-4'>
                        <div className='text-xl select-none'>Total No of Distributors</div>
                        <div className=' text-6xl'>{lendistributor && lendistributor} <span className='text-lg'>distributors</span></div>

                    </div>
                    <div className='rounded-lg bg-white shadow-sm max-w-max p-3 mt-4'>
                        <div className='text-xl select-none'>Total No of Users</div>
                        <div className=' text-6xl'>{lenusers && lenusers}<span className='text-lg'>users</span></div>

                    </div>
                </div> */}
                <div>
                    <div>Distributors</div>
                    <div className='flex flex-col gap-3'>
                        {userdata && userdata.map((user) => (
                            <>
                                {/* <div key={user.id} className='bg-white p-2 rounded-sm flex flex-col'>
                                    <div className='font-semibold'>{user.email}</div>
                                    <div className='text-sm bg-[#064A42] max-w-max text-white px-2 rounded-md cursor-pointer select-none self-end border border-[#064A42] hover:text-[#064A42] hover:bg-white'
                                        onClick={() => { HandleUserDetails(user.id) }}
                                    >more details</div>
                                </div> */}
                                <div key={user.id} className="flex flex-col bg-[#fcfcfc] p-3  whitespace-nowrap rounded-xl w-[400px]">
                                    <div className=' font-semibold'>Name: {user.first_name} {user.last_name}</div>
                                    <div className=' font-semibold'>Company: {user.company_name}</div>
                                    <div className=' font-semibold'>Email: {user.email}</div>
                                    <div className=' font-semibold'>Phone: {user.phone}</div>
                                    <div className='text-sm bg-[#064A42] max-w-max text-white px-2 rounded-md cursor-pointer select-none self-end border border-[#064A42] hover:text-[#064A42] hover:bg-white'
                                        onClick={() => { HandleUserDetails(user.id) }}
                                    >more details</div>
                                </div>

                            </>
                        ))}
                        {userpopup && <div>
                            <UserDetails />
                        </div>
                        }
                    </div>

                </div>
            </div>

        </div>
    )
}

export default AdminDistributors