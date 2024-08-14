import React, { useRef, useState } from 'react'
import whatsappwallpaper from "../Icons/whatsappwallpaper.jpg"
import axios from "axios"
import Cookies from "js-cookie";
import config from '../config';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Personalised(props) {
    const [selectedOption, setSelectedOption] = useState('');
    const [templatename, settemplatename] = useState(' ')
    const [headertext, setheadertext] = useState(' ')
    const [bodytext, setbodytext] = useState(' ')
    const [footertext, setfootertext] = useState(' ')
    const [buttontext, setbuttontext] = useState(' ')
    const [buttoncontent, setbuttoncontent] = useState(' ')
    const [loading, setloading] = useState(false)
    const [errormessage, seterrormessage] = useState()
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;
    const [variableAdded, setVariableAdded] = useState(false);



    const getApiUrl = (option) => {
        switch (option) {
            case 'URL':
                return `${config.baseUrl}post_template/site/personalised?user_id=${userid}`;
            case 'PHONE_NUMBER':
                return `${config.baseUrl}post_template/call/personalised?user_id=${userid}`;
            default:
                return `${config.baseUrl}post_template/text/personalised?user_id=${userid}`;
        }
    };





    const data = (option) => {
        switch (option) {
            case 'URL':
                return {
                    'template_name': templatename,
                    'header_text': headertext,
                    'body_text': bodytext,
                    'footer_text': footertext,
                    'button_text': buttontext,
                    'button_url': buttoncontent,
                };
            case 'PHONE_NUMBER':
                return {
                    'template_name': templatename,
                    'header_text': headertext,
                    'body_text': bodytext,
                    'footer_text': footertext,
                    'button_text': buttontext,
                    'button_url': buttoncontent,
                };
            default:
                return {
                    'template_name': templatename,
                    'header_text': headertext,
                    'body_text': bodytext,
                    'footer_text': footertext,
                    'button_text': "buttontext",
                    'button_url': "buttoncontent",
                };
        }
    };

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
        const apiUrl = getApiUrl(selectedOption)
        setloading(true)
        axios.post(apiUrl, data(selectedOption), { headers: headers })
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


    const handleAddVariable = () => {
        setheadertext((prevHeaderText) => `${prevHeaderText}{{1}}`);
        setVariableAdded(true)
    };
    // const handleAddVariable = () => {
    //     setheadertext((prevHeaderText) => `${prevHeaderText}{{1}}`);
    //     setVariableAdded(true);
    // };
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
            <div className='w-10/12 bg-white mt-10 p-10 rounded-xl min-h-fit overflow-x-auto max-h-full overflow-y-scroll' onClick={props.handleClick}>
                <div className=' text-[#0d291a] text-2xl font-bold select-none'>Create Template</div>
                <form onSubmit={CreateTemplateApi}>
                    <div className=' flex justify-between'>
                        <div className=' flex-1 flex flex-col px-5 mt-2 gap-2'>
                            <label className=' flex flex-col' htmlFor='header'>Template Name
                                <input type="text" placeholder='' id="header" required className='lowercase border border-gray-400 rounded-md h-9 px-3'
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
                                        maxLength={60} value={headertext}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;

                                            if (inputValue.length <= 59) {
                                                setheadertext(inputValue);
                                                seterrormessage('');
                                            } else {
                                                toast.error("Header should not exceed 60 characters.")
                                                // seterrormessage();
                                            }
                                        }} />
                                    <button
                                        className='bg-[#0d291a] text-white max-w-min whitespace-nowrap p-1 rounded-lg self-end'
                                        onClick={handleAddVariable}
                                    >
                                        Add Variable
                                    </button>
                                </label>
                                <label className=' flex flex-col' htmlFor='text-body'>Text Body
                                    <textarea type="text" placeholder='' required id="text-body" className='border border-gray-400 rounded-md h-9 px-3' value={bodytext} onChange={(e) => {
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

                                            if (inputValue.length <= 59) {
                                                setfootertext(e.target.value)
                                                seterrormessage('');
                                            } else {
                                                toast.error("Footer should not exceed 60 characters.")
                                                // seterrormessage();
                                            }
                                        }} />
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
                    <div className='flex flex-col gap-2'>
                        <div className=' text-[#0d291a] text-lg font-bold select-none mt-4'>Button Action</div>
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
                        </label>
                        <button type='submit' className='bg-[#064A42] text-white rounded-md'>submit</button>
                    </div>
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

export default Personalised