import React, { useState } from 'react'
import whatsappwallpaper from "../Icons/whatsappwallpaper.jpg"
import axios from "axios"
import Cookies from "js-cookie";
import config from '../config';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function TextTemplate(props) {
    const [selectedOption, setSelectedOption] = useState('');
    const [templatename, settemplatename] = useState('')
    const [headertext, setheadertext] = useState('')
    const [bodytext, setbodytext] = useState('')
    const [footertext, setfootertext] = useState('')
    const [buttontext, setbuttontext] = useState('')
    const [buttoncontent, setbuttoncontent] = useState('')
    const [loading, setloading] = useState(false)
    const [errormessage, seterrormessage] = useState()
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;




    const getApiUrl = (option) => {
        switch (option) {
            case 'URL':
                return `${config.baseUrl}post_template/site?user_id=${userid}`;
            case 'PHONE_NUMBER':
                return `${config.baseUrl}post_template/call?user_id=${userid}`;
            default:
                return `${config.baseUrl}post_template/text?user_id=${userid}`;
        }
    };





    const data = {
        'template_name': templatename,
        'header_text': headertext,
        'body_text': bodytext,
        'footer_text': footertext,

    }


    // const data = {
    //     'template_name': templatename,
    //     'header_text': headertext,
    //     'body_text': bodytext,
    //     'footer_text': footertext,
    //     'button_text': buttontext,
    //     'button_url': buttoncontent,
    // }


    const ModalClose = () => {
        props.setCreateTemplateModal(null)
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
    const CreateTemplateApi = (e) => {
        e.preventDefault()

        const inputvalues = data

        if (inputvalues.templatename || inputvalues.headertext || inputvalues.bodytext || inputvalues.footertext || inputvalues.buttontext || inputvalues.buttoncontent == "") {
            toast.error('All fields are required.');

        }
        const apiUrl = getApiUrl(selectedOption)
        setloading(true)
        axios.post(apiUrl, inputvalues, { headers: headers })
            .then((response) => {

                ModalClose()
                setloading(false)
                localStorage.setItem('lastFetchTime', Date.now().toString() - 3600000);
            })
            .catch((error) => {

                setloading(false)

            })
    }



    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };
    return (
        <>
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
            <div className='w-10/12 bg-white mt-10 p-10 rounded-xl   overflow-x-auto max-h-full overflow-y-scroll' onClick={props.handleClick}>
                <div className=' text-[#0d291a] text-2xl font-bold select-none'>Create Template</div>
                <form onSubmit={CreateTemplateApi}>
                    <div className=' flex justify-between'>
                        <div className=' flex-1 flex flex-col px-5 mt-2 gap-2'>
                            <label className=' flex flex-col' htmlFor='header'>Template Name
                                <input type="text" placeholder='' required id="header" className='lowercase border border-gray-400 rounded-md h-9 px-3'
                                    onChange={(e) => {
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
                            <div>
                                <label className=' flex flex-col' htmlFor='header'>Header
                                    <input type="text" placeholder='' required id="header" className='border border-gray-400 rounded-md h-9 px-3'
                                        maxLength={60} onChange={(e) => {
                                            const inputValue = e.target.value;

                                            const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]/;
                                            if (inputValue.length <= 59 && !emojiRegex.test(inputValue)) {
                                                setheadertext(inputValue);
                                                seterrormessage('');
                                            } else {
                                                toast.error("Header should not exceed 60 characters and should not contain emojis.")
                                                // seterrormessage();
                                            }
                                        }} />
                                </label>
                                <label className=' flex flex-col' htmlFor='text-body'>Text Body
                                    <textarea type="text" placeholder='' required id="text-body" className='border border-gray-400 rounded-md h-9 px-3'
                                        value={bodytext}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            const sanitizedValue = inputValue.replace(/(\r\n|\n|\r){3,}/g, '\n\n');
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${e.target.scrollHeight}px`;

                                            if (sanitizedValue.length <= 1023) {
                                                setbodytext(sanitizedValue);
                                            } else {
                                                toast.error('Body should not exceed 1024 characters.');
                                            }
                                        }} />
                                </label>
                                <label className=' flex flex-col' htmlFor='footer-body'>Footer
                                    <input type="text" placeholder='' required id="footer-body" className='border border-gray-400 rounded-md h-9 px-3'
                                        maxLength={60}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;

                                            const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]/;
                                            if (inputValue.length <= 59 && !emojiRegex.test(inputValue)) {
                                                setfootertext(inputValue);
                                                seterrormessage('');
                                            } else {
                                                toast.error("Footer should not exceed 60 characters and should not contain emojis.");
                                                // seterrormessage();
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className=' wallpaper-bg w-1/5 p-3'>
                            <div className=' font-semibold'>{templatename}</div>
                            <div className=' bg-[#262d31] text-white px-2 py-1 rounded-r-md rounded-bl-md'>
                                <div className=' font-semibold'>{headertext}</div>
                                <div className=' font-thin text-sm'>{bodytext}</div>
                                <div className=' font-sans text-[10px] text-white/70 border-b border-white/70'>{footertext}</div>
                                <div className='text-center text-xs font-semibold text-blue-300 py-1'>{buttontext}</div>
                            </div>
                        </div>
                    </div>
                    <button type='submit' className='bg-[#064A42] text-white rounded-md w-full mt-3'>submit</button>

                </form>
            </div>
            {loading && <div className=' absolute w-full h-full top-0 flex justify-center items-center bg-black/40'>
                <svg className='animate-spin' width="100px" height="100px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z" fill='#ffffff' />
                    </g>
                </svg>
            </div>}
        </>
    )
}

export default TextTemplate