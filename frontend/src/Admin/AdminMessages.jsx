import React, { useEffect, useState } from 'react'
import AdminWhatsappModule from './AdminWhatsappModule'
import config from '../config'
import axios from 'axios'
import Cookies from "js-cookie";

function AdminMessages() {
    const [messages, setMessages] = useState()
    const accessToken = Cookies.get("accessToken")


    const headers = {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + accessToken
    }
    const GetMessages = () => {
        axios.get(`${config.baseUrl}contact-form/`, { headers: headers })
            .then((response) => {

                setMessages(response.data)
            }).catch((error) => {

            })
    }

    useEffect(() => {
        GetMessages()


    }, [])

    return (
        <>
            <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
                <div className='h-full'>
                    <AdminWhatsappModule select={"admin_messages"} />
                </div>
                <div className='flex-1 p-5 h-screen overflow-y-scroll'>
                    <div className=' text-3xl font-bold'>Enquiries</div>
                    <table class="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    User
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Email
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Phone
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Issue
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {messages && messages.map((message) => (
                                <tr>
                                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div class="flex items-center">
                                            <div class="ml-3">
                                                <p class="text-gray-900 whitespace-no-wrap">
                                                    {message.first_name} {message.last_name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">{message.email}</p>
                                    </td>
                                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                            {message.phone}
                                        </p>
                                    </td>
                                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                            {message.issue_description}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </>
    )
}

export default AdminMessages