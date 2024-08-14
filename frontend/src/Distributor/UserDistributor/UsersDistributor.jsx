import React, { useEffect, useState } from 'react'
import config from '../../config'
import Cookies from "js-cookie";
import axios from 'axios';
import DistributorWhatsappModule from '../DistributorWhatsappModule';
import { jwtDecode } from 'jwt-decode';
import { TfiReload } from "react-icons/tfi";
import { FaCopy } from "react-icons/fa";


function UsersDistributor() {
    const [userdata, setuserdata] = useState()
    const [userpopup, setUserpopup] = useState()
    const [userdetail, setUserdetail] = useState()
    const [referal_string, setReferal_string] = useState()
    const [isCopied, setIsCopied] = useState(false);
    const [userfeatures, setUserfeatures] = useState({
        excel_feature: "",
        image_feature: "",
        is_active: '',
        is_distributor: '',
        messaging_feature: '',
        personalised_feature: '',
    });
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }

    const Getusers = () => {
        axios.get(`${config.baseUrl}user-children/${userid}/`, { headers: headers })
            .then((response) => {
                setuserdata(response.data)

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
    const GetReferal = () => {
        axios.get(`${config.baseUrl}/user/${userid}/view-referral/`, { headers: headers })
            .then((response) => {

                setReferal_string(response.data.referral_string)
            })
            .catch((error) => {

            })
    }


    const RevokeReferal = () => {
        axios.put(`${config.baseUrl}/user/${userid}/view-referral/`, { headers: headers })
            .then((response) => {

                setReferal_string(response.data.referral_string)
            })
            .catch((error) => {

            })
    }




    useEffect(() => {
        Getusers()
        GetReferal()
    }, [])



    return (
        <>
            <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
                <div className='h-full'>
                    <DistributorWhatsappModule select={"distributor_users"} />
                </div>
                <div className='flex-1 p-5 h-screen overflow-y-scroll'>
                    <div className=' text-3xl font-bold'>Users</div>
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
                    <div className='flex flex-wrap gap-4'>
                        {userdata && userdata.map((user) => (
                            <>
                                <div key={user.id} className='bg-white p-2 rounded-sm flex flex-col'>
                                    <div className='font-semibold'>{user.email}</div>
                                    {/* <div className='text-sm bg-[#064A42] max-w-max text-white px-2 rounded-md cursor-pointer select-none self-end border border-[#064A42] hover:text-[#064A42] hover:bg-white'
                                        onClick={() => { HandleUserDetails(user.id) }}
                                    >more details</div> */}
                                </div>
                                {/* {userpopup && <div>
                                    <UserDetails userid={user.id} useremail={user.email} />

                                </div>
                                } */}
                            </>
                        ))}
                    </div>

                </div>
            </div>
        </>
    )
}

export default UsersDistributor
// const UserDetails = ({ userid, useremail }) => {

//     const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + accessToken
//     }
//     const handleFeatureToggle = (feature) => {
//         setUserfeatures(prevState => ({
//             ...prevState,
//             [feature]: !prevState[feature]
//         }))
//     };
//     const updateUserFeatures = () => {
//         axios.put(`${config.baseUrl}users/${userid}/`, userfeatures, { headers: headers })
//             .then((response) => {
//                 // setUserfeatures(response.data);
//
//             })
//             .catch((error) => {
//
//             })
//     };
//     useEffect(() => {
//         updateUserFeatures()


//     }, [userfeatures]);


//     return (
//         <div className='absolute w-screen h-screen top-0 left-0 bg-black/10 flex justify-center items-center '
//             onClick={() => { setUserpopup(false); }} >
//             <div className='bg-white w-10/12 h-[80%] rounded-lg p-4' onClick={(event) => { event.stopPropagation(); }}>
//                 <div className=' flex flex-col items-end'>
//                     <div>Referal Id</div>
//                     <div className='px-2 bg-[#064A42] text-white rounded-lg flex items-center gap-5 relative'>
//                         {isCopied && (
//                             <div className="absolute text-xs bg-gray-800 text-white px-2 py-1 rounded mt-2">
//                                 Copied!
//                             </div>
//                         )}
//                         <FaCopy onClick={handleCopyClick} className='cursor-pointer' />
//                         <div>{referal_string}</div>
//                         <div onClick={RevokeReferal} className='bg-[#064A42] text-white text-xl hover:bg-white hover:text-[#064A42] p-1 rounded-lg' >
//                             <TfiReload className='cursor-pointer' />
//                         </div>
//                     </div>
//                 </div>
//                 <div className='text-xl font-bold'>User Details</div>
//                 {userdetail && <div className='bg-white p-2 rounded-sm flex flex-col'>
//                     {/* <div className='font-semibold text-3xl py-4'>{useremail}</div> */}
//                     <label htmlFor="toggleExcel" className="flex justify-between items-center cursor-pointer  p-3 rounded-xl">
//                         <div className='font-semibold text-3xl py-4'>{useremail}</div>
//                         <div className="relative">
//                             <input
//                                 type="checkbox"
//                                 id="toggleExcel"
//                                 className="sr-only"
//                                 checked={userfeatures.is_active}
//                                 onChange={() => handleFeatureToggle('is_active')}
//                             />
//                             <div className="block bg-gray-500 w-14 h-8 rounded-full back-check"></div>
//                             <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
//                         </div>
//                     </label>
//                     <div className='flex flex-wrap gap-4'>

//                         <label htmlFor="toggleExcel" className="flex items-center cursor-pointer bg-slate-200 max-w-max p-3 rounded-xl">
//                             <span>Excel Feature</span>
//                             <div className="relative">
//                                 <input
//                                     type="checkbox"
//                                     id="toggleExcel"
//                                     className="sr-only"
//                                     checked={userfeatures.excel_feature}
//                                     onChange={() => handleFeatureToggle('excel_feature')}
//                                 />
//                                 <div className="block bg-gray-500 w-14 h-8 rounded-full back-check"></div>
//                                 <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
//                             </div>
//                         </label>

//                         <label htmlFor="toggleImage" className="flex items-center cursor-pointer bg-slate-200 max-w-max p-3 rounded-xl">
//                             <span>Image Feature</span>
//                             <div className="relative">
//                                 <input
//                                     type="checkbox"
//                                     id="toggleImage"
//                                     className="sr-only"
//                                     checked={userfeatures.image_feature}
//                                     onChange={() => handleFeatureToggle('image_feature')}
//                                 />
//                                 <div className="block bg-gray-500 w-14 h-8 rounded-full back-check"></div>
//                                 <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
//                             </div>
//                         </label>

//                         <label htmlFor="toggleMessaging" className="flex items-center cursor-pointer bg-slate-200 max-w-max p-3 rounded-xl">
//                             <span>Messaging Feature</span>
//                             <div className="relative">
//                                 <input
//                                     type="checkbox"
//                                     id="toggleMessaging"
//                                     className="sr-only"
//                                     checked={userfeatures.messaging_feature}
//                                     onChange={() => handleFeatureToggle('messaging_feature')}
//                                 />
//                                 <div className="block bg-gray-500 w-14 h-8 rounded-full back-check"></div>
//                                 <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
//                             </div>
//                         </label>
//                         <label htmlFor="togglePersonal" className="flex items-center cursor-pointer bg-slate-200 max-w-max p-3 rounded-xl">
//                             <span>Personalised Messaging Feature</span>
//                             <div className="relative">
//                                 <input
//                                     type="checkbox"
//                                     id="togglePersonal"
//                                     className="sr-only"
//                                     checked={userfeatures.personalised_feature}
//                                     onChange={() => handleFeatureToggle('personalised_feature')}
//                                 />
//                                 <div className="block bg-gray-500 w-14 h-8 rounded-full back-check"></div>
//                                 <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
//                             </div>
//                         </label>
//                     </div>

//                 </div>}
//             </div>

//         </div>
//     )
// }