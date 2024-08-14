import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import config from '../config';
import WhatsappModule from '../WhatsappModule';
import { jwtDecode } from 'jwt-decode';
import { TfiReload } from "react-icons/tfi";
import { FaCopy } from "react-icons/fa";



function Users() {
    const [userdata, setuserdata] = useState({})
    const accessToken = Cookies.get("accessToken")
    const [referal_string, setReferal_string] = useState()
    const userid = jwtDecode(accessToken).user_id;
    const is_admin = jwtDecode(accessToken).user_is_staff;
    const [isCopied, setIsCopied] = useState(false);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }


    useEffect(() => {
        {
            is_admin ?
                axios.get(`${config.baseUrl}user-hierarchy/${userid}/`, { headers: headers })
                    .then((response) => {

                        setuserdata(response.data)
                        // const filteredUsers = response.data.filter(user => !user.is_staff);

                        // setuserdata(filteredUsers);
                    })
                    .catch((error) => {

                    })
                :
                axios.get(`${config.baseUrl}user-children/${userid}/`, { headers: headers })
                    .then((response) => {

                        setuserdata(response.data)
                    })
                    .catch((error) => {

                    })

        }

        axios.get(`${config.baseUrl}/user/${userid}/view-referral/`, { headers: headers })
            .then((response) => {

                setReferal_string(response.data.referral_string)
            })
            .catch((error) => {

            })
    }, [referal_string])

    const RevokeReferal = () => {
        axios.put(`${config.baseUrl}/user/${userid}/view-referral/`, { headers: headers })
            .then((response) => {

                setReferal_string(response.data.referral_string)
            })
            .catch((error) => {

            })
    }


    const DisableUser = (key, is_active) => {
        const data = {
            "is_active": !is_active
        }
        axios.patch(`${config.baseUrl}users/${key}/`, data, { headers: headers })
            .then((response) => {

                axios.get(`${config.baseUrl}user-hierarchy/${userid}/`, { headers: headers })
                    .then((response) => {

                        setuserdata(response.data)
                    })
                    .catch((error) => {

                    })
            })
            .catch((error) => {

            })
    }
    const MakeDistributor = (key, is_distributor) => {
        const data = {
            "is_distributor": !is_distributor
        }
        axios.patch(`${config.baseUrl}users/${key}/`, data, { headers: headers })
            .then((response) => {

                axios.get(`${config.baseUrl}user-hierarchy/${userid}/`, { headers: headers })
                    .then((response) => {

                        setuserdata(response.data)
                    })
                    .catch((error) => {

                    })
            })
            .catch((error) => {

            })
    }

    const handleCopyClick = () => {
        navigator.clipboard.writeText(referal_string)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 1200); // Hide the tooltip after 2 seconds
            })
            .catch((err) => {
                console.error('Unable to copy text to clipboard', err);
            });
    };


    const TreeNode = ({ user }) => {
        return (
            <>
                <tr>
                    <td>
                        {user.email}
                    </td>

                    <td>
                        {user.is_distributor ? "Distributor" : "User"}
                    </td>
                    <td>{user.is_active ? "Active" : "Not-Active"}</td>
                    <td >
                        <button className='hover:bg-black/90 hover:text-white p-1 rounded-lg border border-black' onClick={() => DisableUser(user.id, user.is_active)}>
                            {user.is_active ? "Disable" : "Enable"}
                        </button>
                    </td>
                    <td >
                        <button className='hover:bg-black/90 hover:text-white p-1 rounded-lg border border-black' onClick={() => MakeDistributor(user.id, user.is_distributor)}>
                            {user.is_distributor ? "Change to User" : "Change to Distributor"}
                        </button>
                    </td>
                </tr>
                <>
                    {user.children && user.children.map((child) => (
                        <TreeNode user={child} ></TreeNode>
                    ))}
                </>
            </>
        );
    };
    return (
        <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
            <div className='h-full'>
                <WhatsappModule select={"users"} />
            </div>
            <div className='p-5 flex-1'>
                <div className=' flex flex-col items-end'>
                    <div>Referal Id</div>
                    <div className='px-2 bg-[#064A42] text-white rounded-lg flex items-center gap-5 relative'>
                        {isCopied && (
                            <div className="absolute text-xs bg-gray-800 text-white px-2 py-1 rounded mt-2">
                                Copied!
                            </div>
                        )}
                        <FaCopy onClick={handleCopyClick} className='cursor-pointer' />
                        <div>{referal_string}</div>
                        <div onClick={RevokeReferal} className='bg-[#064A42] text-white text-xl hover:bg-white hover:text-[#064A42] p-1 rounded-lg' >
                            <TfiReload className='cursor-pointer' />
                        </div>
                    </div>
                </div>

                <div>
                    {/* <TreeNode node={userdata} /> */}

                </div>
                <table className='table-auto w-full mt-6 text-center'>
                    <thead className=' bg-slate-500'>
                        <tr>
                            <th>User Emails </th>
                            {is_admin ? <th>User Role </th> : ""}
                            <th>Active/In-Active</th>
                            <th>Disable User</th>
                            {is_admin ? <th>Make Distributor </th> : ""}
                            {/* <th>Make Distributor</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {is_admin ?
                            <TreeNode user={userdata} /> : <>
                                {userdata && userdata.length > 0 ? (
                                    userdata.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.email}</td>
                                            <td>{user.is_active ? "Active" : "Not-Active"}</td>
                                            <td>
                                                <button className='hover:bg-black/90 hover:text-white p-2 rounded-lg' onClick={() => DisableUser(user.id, user.is_active)}>
                                                    {user.is_active ? "Disable" : "Enable"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className='col-span-3'>No user data available.</td>
                                    </tr>
                                )}
                            </>
                        }
                    </tbody>
                </table>
            </div >
        </div >
    )
}

export default Users