import axios from 'axios'
import React, { useState } from 'react'
import Cookies from "js-cookie";
import config from '../config';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Document(props) {
    const [selectedOption, setSelectedOption] = useState('');
    const [templatename, settemplatename] = useState(' ')
    const [headerimage, setheaderimage] = useState(' ')
    const [headerimageview, setheaderimageview] = useState(' ')
    const [bodytext, setbodytext] = useState(' ')
    const [footertext, setfootertext] = useState(' ')
    const [buttontext, setbuttontext] = useState(' ')
    const [buttoncontent, setbuttoncontent] = useState(' ')
    const [imageupload, setimageupload] = useState('')
    const [uploadbtn, setuploadbtn] = useState(true)
    const [buttonloading, setbuttonloading] = useState(false);
    const [loading, setloading] = useState(false)
    const [errormessage, seterrormessage] = useState()
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;




    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setheaderimage(event.target.files[0])
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setheaderimageview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };



    const handleUpload = () => {
        setbuttonloading(true);
        setbuttonloading(true);
        if (templatename !== ' ') {
            const formData = new FormData();
            formData.append('template_image', headerimage);
            formData.append('template_name', templatename);

            axios
                .post(`${config.baseUrl}upload/image?user_id=${userid}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer ' + accessToken
                    },
                })
                .then((response) => {

                    setimageupload(response.data.h);
                    setuploadbtn(false);
                    setbuttonloading(false);
                })
                .catch((error) => {
                    console.error('Error uploading image:', error);
                    setbuttonloading(false);
                });

        } else {
            alert("add template name")
        }
    };


    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }

    // const data = {
    //     'template_name': templatename,
    //     'header_text': imageupload,
    //     'body_text': bodytext,
    //     'footer_text': footertext,
    //     // 'button_text': buttontext,
    // }
    const HandleTemplateUpload = (e) => {
        e.preventDefault()
        const apiUrl = getApiUrl(selectedOption)


        axios.post(apiUrl, data(selectedOption), { headers: headers }).then((response) => {


            props.setCreateTemplateModal(null)
            localStorage.setItem('lastFetchTime', Date.now().toString() - 3600000);

        }).catch((error) => {

            setloading(false)
        })
    }


    const getApiUrl = (option) => {
        switch (option) {
            case 'URL':
                return `${config.baseUrl}post_template/image/url?user_id=${userid}&type=DOCUMENT`;
            case 'PHONE_NUMBER':
                return `${config.baseUrl}post_template/image/call?user_id=${userid}&type=DOCUMENT`;
            default:
                return `${config.baseUrl}post_template/image?user_id=${userid}&type=DOCUMENT`;
        }
    };





    const data = (option) => {
        switch (option) {
            case 'URL':
                return {
                    'template_name': templatename,
                    'header_text': imageupload,
                    'body_text': bodytext,
                    'footer_text': footertext,
                    'button_text': buttontext,
                    'button_url': buttoncontent,
                };
            case 'PHONE_NUMBER':
                return {
                    'template_name': templatename,
                    'header_text': imageupload,
                    'body_text': bodytext,
                    'footer_text': footertext,
                    'button_text': buttontext,
                    'button_url': buttoncontent,
                };
            default:
                return {
                    'template_name': templatename,
                    'header_text': imageupload,
                    'body_text': bodytext,
                    'footer_text': footertext,
                    'button_text': "buttontext",
                    'button_url': "buttoncontent",
                };
        }
    };

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    return (<>
        <div className='text-xs'>
            <ToastContainer
                position="top-left"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
        <form onSubmit={HandleTemplateUpload} className='w-10/12 bg-white mt-10 p-10 rounded-xl max-h-full overflow-y-scroll' onClick={props.handleClick}>
            <div className=' text-[#0d291a] text-2xl font-bold select-none'>Create Document Template</div>
            <div className=' flex justify-between flex-wrap-reverse'>
                <div className='flex-1'>
                    <div className=' flex-1 flex flex-col px-5 mt-2 gap-2'>
                        <label className='flex flex-col'>Template Name
                            <input className='lowercase border border-gray-400 rounded-md h-9 px-3' required onChange={(e) => {
                                const inputValue = e.target.value;
                                const isValidInput = /^[a-z\s]*$/.test(inputValue);
                                if (isValidInput) {
                                    const textWithUnderscores = inputValue.replace(/ /g, '_');
                                    settemplatename(textWithUnderscores);
                                    seterrormessage('');
                                } else {
                                    toast.error("Invalid Input, lowercase letter only allowed")
                                    // seterrormessage('Invalid input. Only letters are allowed.');
                                }
                            }} />
                        </label>
                        <div className='flex items-end gap-3'>
                            <label className=' flex flex-col'>Select an Image
                                <input type="file" placeholder='' id="" required className='border border-gray-400 rounded-md h-9 px-3' onChange={handleImageChange} />
                            </label>
                            {uploadbtn &&
                                <div className='py-1 px-2 rounded-lg select-none cursor-pointer text-white bg-[#133624] whitespace-nowrap h-fit' onClick={handleUpload}>
                                    {buttonloading ? <div class="w-6 h-6 rounded-full animate-spin
                                border-2 border-solid border-white border-t-transparent">  </div> : 'Upload Image'} </div>
                            }
                        </div>

                        <label className=' flex flex-col' htmlFor='text-body'>Text Body
                            <textarea type="text" placeholder='' required id="text-body" className='border border-gray-400 rounded-md h-9 px-3' value={bodytext} onChange={(e) => {
                                const inputValue = e.target.value;
                                const sanitizedValue = inputValue.replace(/(\r\n|\n|\r){3,}/g, '\n\n');
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;

                                if (sanitizedValue.length <= 550) {
                                    setbodytext(sanitizedValue);
                                } else {
                                    toast.error('Body should not exceed 1024 characters.');
                                }
                            }} />
                        </label>
                        <label className=' flex flex-col' htmlFor='footer-body'>Footer
                            <input type="text" placeholder='' id="footer-body" required className='border border-gray-400 rounded-md h-9 px-3' onChange={(e) => { setfootertext(e.target.value) }} />
                        </label>
                        {/* <button onClick={HandleTemplateUpload} disabled={uploadbtn} className='bg-[#064A42] text-white rounded-md ' >submit</button> */}
                    </div>
                </div>
                <div className='flex-1 flex justify-center'>
                    <div className=' wallpaper-bg w-[300px] p-3'>
                        <div className=' font-semibold'>{templatename}</div>
                        <div className=' bg-[#262d31] text-white px-2 py-1 rounded-r-md rounded-bl-md'>
                            {/* <div className=' font-semibold'>{headertext}</div> */}
                            <img src={headerimageview} alt="" />
                            <div className=' font-thin text-sm'>{bodytext}</div>
                            <div className=' font-sans text-[10px] text-white/70 border-b border-white/70'>{footertext}</div>
                            <div className='text-center text-xs font-semibold text-blue-300 py-1'>{buttontext}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <button type="submit" disabled={uploadbtn} className='bg-[#064A42] text-white rounded-md ' >submit</button>

                {/* <div className=' text-[#0d291a] text-lg font-bold select-none mt-4'>Button Action</div>
                <select
                    className=' border border-gray-400 text-sm'
                    value={selectedOption}
                    onChange={handleOptionChange}>
                    <option value="">No Button</option>
                    <option value="URL">URL Button</option>
                    <option value="PHONE_NUMBER">Call Button</option>
                </select>
                <label className=' flex flex-col' htmlFor='button-text'>Button Text
                    <input type="text" name="" id="button-text" className='border border-gray-400 rounded-md h-9 px-3' onChange={(e) => { setbuttontext(e.target.value) }} />
                </label>
                <label className=' flex flex-col' htmlFor='button-text'>Button Url/Number
                    <input type="text" name="" placeholder='add number with country code' id="button-text" className='border border-gray-400 rounded-md h-9 px-3' onChange={(e) => { setbuttoncontent(e.target.value) }} />
                </label> */}
            </div>
        </form >
        {loading && <div className=' absolute w-full h-full top-0 left-0 flex justify-center items-center bg-black/40'>
            <svg className='animate-spin' width="100px" height="100px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z" fill='#ffffff' />
                </g>
            </svg>
        </div>
        }
    </>
    )
}

export default Document