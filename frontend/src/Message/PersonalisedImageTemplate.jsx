import axios from 'axios'
import React, { useState } from 'react'
import Cookies from "js-cookie";
import config from '../config';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function PersonalisedImageTemplate(props) {
    const [templatename, settemplatename] = useState(' ')
    const [headerimage, setheaderimage] = useState(' ')
    const [headerimageview, setheaderimageview] = useState(' ')
    const [bodytext, setbodytext] = useState(' ')
    const [footertext, setfootertext] = useState(' ')
    const [buttontext, setbuttontext] = useState(' ')
    const [imageupload, setimageupload] = useState('')
    const [uploadbtn, setuploadbtn] = useState(true)
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



    const handleUpload = (e) => {
        e.preventDefault()

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
                })
                .catch((error) => {
                    console.error('Error uploading image:', error);
                });
        } else {
            alert("add template name")
        }
    };



    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }

    const data = {
        'template_name': templatename,
        'header_text': imageupload,
        'body_text': bodytext,
        'footer_text': footertext,
        // 'button_text': buttontext,
    }
    const HandleTemplateUpload = (e) => {
        if (e) {
            e.preventDefault();
        }
        // handleUpload()
        setloading(true)
        axios.post(`${config.baseUrl}post_template/image/personalised?user_id=${userid}`, data, { headers: headers }).then((response) => {

            setloading(false)
            props.setCreateTemplateModal(null)
        }).catch((error) => {

            setloading(false)

        })
    }

    const handleAddVariable = () => {
        setbodytext((prevHeaderText) => `${prevHeaderText}{{1}}`);
        // setVariableAdded(true)
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
        <div className='w-10/12 bg-white mt-10 p-10 rounded-xl max-h-full overflow-y-scroll' onClick={props.handleClick}>
            <div className=' text-[#0d291a] text-2xl font-bold select-none'>Create Image Template</div>
            <div className=' flex justify-between flex-wrap-reverse'>
                <form onSubmit={HandleTemplateUpload} className='flex-1'>
                    <div className=' flex-1 flex flex-col px-5 mt-2 gap-2'>
                        <label className='flex flex-col'>Template Name
                            <input required className='lowercase border border-gray-400 rounded-md h-9 px-3' onChange={(e) => {
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

                                <div className='py-1 px-2 rounded-lg select-none cursor-pointer text-white bg-[#133624] whitespace-nowrap h-fit' onClick={handleUpload}>Upload Image</div>
                            }
                        </div>

                        <label className=' flex flex-col' htmlFor='text-body'>Text Body
                            <textarea type="text" required placeholder='' id="text-body" className='border border-gray-400 rounded-md h-9 px-3 [field-sizing:content]' value={bodytext} onChange={(e) => {
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
                            <button
                                className='bg-[#0d291a] text-white max-w-min whitespace-nowrap p-1 rounded-lg self-end'
                                onClick={handleAddVariable}
                            >
                                Add Variable
                            </button>
                        </label>
                        <label className=' flex flex-col' htmlFor='footer-body'>Footer
                            <input type="text" placeholder=' ' required id="footer-body" className='border border-gray-400 rounded-md h-9 px-3' onChange={(e) => { setfootertext(e.target.value) }} />
                        </label>
                        <button type='submit' className='bg-[#064A42] text-white rounded-md ' >submit</button>
                    </div>
                </form>
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
        </div>
        {loading && <div className=' absolute w-full h-full top-0 left-0 flex justify-center items-center bg-black/40'>
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

export default PersonalisedImageTemplate