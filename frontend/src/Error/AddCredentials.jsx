import React, { useState } from 'react'
import { AiOutlineInfoCircle } from 'react-icons/ai';
import Cookies from "js-cookie";
import axios from 'axios';
import config from '../config';
import { jwtDecode } from 'jwt-decode';
import { LuMailWarning } from "react-icons/lu";
import { Link } from 'react-router-dom';

function AddCredentials({ phonenumberId, businessId, access, setErrorManage, appid1 }) {
    const [phid, setPhid] = useState(phonenumberId || '')
    const [whid, setWhid] = useState(businessId || '')
    const [appid, setAppid] = useState(appid1 || '')
    const [accesstoken, setAccesstoken] = useState()
    const [activeButton, setActiveButton] = useState(null);
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;
    const [loading, setloading] = useState(false)


    const data = {
        "user_id": userid,
        "phone_number_id": phid,
        "whatsapp_business_id": whid,
        "permanent_access_token": accesstoken,
        "app_id": appid
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }

    const UploadCredentials = (e) => {
        e.preventDefault()
        setloading(true)
        axios.post(`${config.baseUrl}upload/credentials`, data, { headers: headers })
            .then((response) => {

                setPhid('')
                setWhid('')
                setAccesstoken('')
                setAppid('')
                setloading(false)
                setErrorManage(false)
            })
            .catch((error) => {

                setloading(false)
            })
    }


    const handleMouseEnter = (buttonIndex) => {
        setTimeout(() => {
            setActiveButton(buttonIndex);
        }, 1000);
    };

    const handleMouseLeave = () => {
        setTimeout(() => {
            setActiveButton(null);
        }, 500);
    };

    return (
        <div className='w-7/12 bg-white rounded-xl h-auto p-3 relative'>
            <div className='absolute top-2 right-2  px-1 text-xs bg-red-300 text-red-600 rounded-xl'> Message !</div>
            <h1 className='text-xl font-bold'>Add Meta Credentials</h1>
            <div className=' flex max-md:flex-wrap-reverse'>
                <form onSubmit={UploadCredentials} className='pt-5 flex flex-col gap-4 w-full'>
                    <label className=' flex flex-col' htmlFor='whatsapp_id'>
                        <div className=' flex justify-between'>
                            <div>Phone Number Id</div>
                            <div className=' cursor-help relative'
                                onMouseEnter={() => handleMouseEnter(1)}
                                onMouseLeave={handleMouseLeave}>
                                <AiOutlineInfoCircle />
                                {activeButton === 1 && <div className='absolute bg-[#f2efeb] text-black text-[8px] px-2 py-1 w-[220px] rounded-lg shadow-md'>get the phone number id from whatsapp Credentials manager in the facebook developer console</div>}
                            </div>
                        </div>
                        <input required type="text" placeholder='Add phone number id' id="whatsapp_id" className='border border-gray-400 rounded-md h-9 px-3' value={phid} onChange={(e) => { setPhid(e.target.value) }} />
                    </label>
                    <label className=' flex flex-col' htmlFor='business_id'>
                        <div className=' flex justify-between'>
                            <div>Whatsapp Business Id</div>
                            <div className=' cursor-help relative'
                                onMouseEnter={() => handleMouseEnter(2)}
                                onMouseLeave={handleMouseLeave}>
                                <AiOutlineInfoCircle />
                                {activeButton === 2 && <div className='absolute bg-[#f2efeb] text-black text-[8px] px-2 py-1 w-[220px] rounded-lg shadow-md'>get the whatsapp business id from whatsapp Credentials manager in the facebook developer console</div>}
                            </div>
                        </div>
                        <input required type="text" placeholder='Add whatsapp business id' id="business_id" className='border border-gray-400 rounded-md h-9  px-3' value={whid} onChange={(e) => { setWhid(e.target.value) }} />
                    </label>
                    <label className=' flex flex-col' htmlFor='business_id'>
                        <div className=' flex justify-between'>
                            <div>App Id</div>
                            <div className=' cursor-help relative'
                                onMouseEnter={() => handleMouseEnter(4)}
                                onMouseLeave={handleMouseLeave}>
                                <AiOutlineInfoCircle />
                                {activeButton === 4 && <div className='absolute bg-[#f2efeb] text-black text-[8px] px-2 py-1 w-[220px] rounded-lg shadow-md'>get the app id from whatsapp Credentials manager in the facebook developer console</div>}
                            </div>
                        </div>
                        <input required type="text" placeholder='' id="business_id" className='border border-gray-400 rounded-md h-9  px-3' value={appid} onChange={(e) => { setAppid(e.target.value) }} />
                    </label>
                    <label className=' flex flex-col' htmlFor='acccess_token'>
                        <div className=' flex justify-between'>
                            <div>Permanent Access Token</div>
                            <div className=' cursor-help relative'
                                onMouseEnter={() => handleMouseEnter(3)}
                                onMouseLeave={handleMouseLeave}>
                                <AiOutlineInfoCircle />
                                {activeButton === 3 && <div className='absolute bg-[#f2efeb] text-black text-[8px] px-2 py-1 w-[220px] rounded-lg shadow-md'>get the permanent access token from whatsapp Credentials manager in the facebook developer console</div>}
                            </div>
                        </div>
                        <input required type="text" placeholder='Add access token' id="acccess_token" className='border border-gray-400 rounded-md h-9 px-3' value={accesstoken} onChange={(e) => { setAccesstoken(e.target.value) }} />
                    </label>
                    <button className=' p-2 bg-[#0d291a] text-white w-min whitespace-nowrap rounded-lg self-end'>Submit Credentials</button>
                </form>
                <div className='p-2 flex flex-col text-sm items-center gap-4'>
                    {access == 'added-not-valid' &&
                        <>
                            <div className=' font-bold text-red-600'>Error validating access token: Session has expired</div>
                            <div className=' text-center text-8xl font-black' ><LuMailWarning /></div>
                            <div className='font-bold text-center'>Your phone number has been disconnected from Altos Connect</div>
                            <div className='font-bold text-center'>To Know How to add Credentials <Link to="/#video"><span className='text-blue-800 underline'>Tap Here</span></Link></div>


                        </>
                    }
                    {access == 'not-added' &&
                        <>
                            <div className=' font-bold text-blue-600'>Add Credentials </div>
                            {/* <div className=' text-center text-8xl font-black' ><LuMailWarning /></div> */}
                            <div className='font-bold text-center'>Connect Your Whatsapp to Altos Connect</div>
                            <div className='font-bold text-center'>To Know How to add Credentials <Link to="/#video"><span className='text-blue-800 underline'>Tap Here</span></Link></div>

                        </>}
                    {/* <div className=' font-bold text-red-600'>Error validating access token: Session has expired</div>
                    <div className=' text-center text-8xl font-black' ><LuMailWarning /></div>
                    <div className='font-bold text-center'>Your phone number has been disconnected from Altos Connect</div> */}
                </div>
            </div>

        </div>
    )
}

export default AddCredentials