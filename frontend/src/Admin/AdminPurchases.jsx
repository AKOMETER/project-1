import React, { useEffect, useState } from 'react'
import AdminWhatsappModule from './AdminWhatsappModule'
import config from '../config'
import axios from 'axios'
import Cookies from "js-cookie";
import { FaImages } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
function AdminPurchases() {
    const [messages, setMessages] = useState()
    const accessToken = Cookies.get("accessToken")
    const [modalOpen, setModalOpen] = useState(false);
    const [image, setImage] = useState('');

    const toggleModal = (image) => {

        setImage(`${config.imagebaseurl}${image}`)
        setModalOpen(!modalOpen);
    };

    const headers = {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + accessToken
    }
    const GetMessages = () => {
        axios.get(`${config.baseUrl}plan-purchases/`, { headers: headers })
            .then((response) => {

                setMessages(response.data)
            }).catch((error) => {

            })
    }
    function formatDate(dateString) {
        const inputDate = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return inputDate.toLocaleDateString('en-US', options);
    }

    useEffect(() => {
        GetMessages()
    }, [])

    return (
        <>
            <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
                <div className='h-full'>
                    <AdminWhatsappModule select={"admin_purchases"} />
                </div>
                <div className='flex-1 p-5 h-screen overflow-y-scroll'>
                    <div className=' text-3xl font-bold'>Enquiries</div>
                    <table class="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Plan Purchased Date
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Plan
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Date Started
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Plan End Date
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    View ScreenShot
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {messages && messages.map((message) => {

                                const currentDate = new Date();
                                const inputDate = new Date(message.started_date);
                                const daysToAdd = 30;
                                inputDate.setDate(inputDate.getDate() + daysToAdd);
                                const resultDate = inputDate.toISOString().split('T')[0];
                                const messageDate = new Date(resultDate);
                                const diffInDays = Math.ceil((messageDate - currentDate) / (1000 * 60 * 60 * 24));

                                return (
                                    <tr>
                                        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p class="text-gray-900 whitespace-no-wrap">{message.user_first_name} {message.user_last_name}</p>
                                        </td>
                                        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p class="text-gray-900 whitespace-no-wrap">
                                                {message.plan}
                                            </p>
                                        </td>
                                        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div class="flex items-center">
                                                <p
                                                    className="text-gray-900 whitespace-no-wrap">
                                                    {formatDate(message.started_date)}
                                                </p>
                                            </div>

                                        </td>
                                        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p class={`text-gray-900 whitespace-no-wrap ${diffInDays <= 4 ? 'text-red-500' : ''
                                                }`}>
                                                {formatDate(resultDate)}
                                            </p>
                                        </td>
                                        <td class="px-5 py-5 border-b border-gray-200 bg-white text-3xl  text-center" onClick={() => { toggleModal(message.image) }}>
                                            <FaImages />
                                        </td>
                                    </tr>
                                )
                            })}
                            {modalOpen && (
                                <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
                                    <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
                                        <img src={image} alt="Modal Image" className="w-full h-auto" />
                                        <button onClick={toggleModal} className="absolute top-0 right-0 m-4 text-gray-600 hover:text-red-500 text-4xl">
                                            <IoCloseSharp />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </tbody>

                    </table>
                </div>
            </div>
        </>
    )
}

export default AdminPurchases