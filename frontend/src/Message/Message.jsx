import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import whatsapplogo from "../Icons/whatsapp.png"
import whatsappgif from "../Icons/whatsappgif.gif"
import Cookies from "js-cookie";
import config from '../config';
import WhatsappModule from '../WhatsappModule';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TemplateApi, { DataContext } from '../Context/TemplatesApi';

function Message() {
    const [phoneNumberInput, setPhoneNumberInput] = useState('');
    const [custommessage, setCustommessage] = useState('');
    const [messagingbox, setMessagingbox] = useState(true)
    const [numberdata, setNumberdata] = useState([])
    const [templateData, setTemplateData] = useState();
    // const [templateName, setTemplateName] = useState('');
    const [successMessage, setSuccessMessage] = useState(false);
    const [componentData, setcomponentData] = useState()
    const [selectedHeaderText, setSelectedHeaderText] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [selectedBodyText, setSelectedBodyText] = useState('')
    const [selectedFooterText, setSelectedFooterText] = useState('')
    const [headerHandle, setHeaderHandle] = useState('');
    const [select, setSelect] = useState()
    const [apiurl1, setApiurl1] = useState();
    // const [apiurl2, setApiurl2] = useState();
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;

    const findFormat = (components) => {
        const selectedComponent = components.find(component => component.type === 'HEADER');
        const format = selectedComponent ? selectedComponent.format : null;
        return format ? format.toLowerCase() : null;
    };
    const handleSelectChange = (event) => {
        const name = event.target.value;
        setSelect(name)
        setSelectedName(name);

        const imageName = templateData.images.find((image) => image[name]);
        if (imageName) {
            setHeaderHandle(imageName[name] || '');
        } else {
            setHeaderHandle("")
        }
        const selectedComponent = templateData.components[templateData.names.indexOf(name)];
        setcomponentData(selectedComponent)
        if (selectedComponent) {
            const header = selectedComponent.find((component) => component.type === 'HEADER');
            setSelectedHeaderText(header ? header.text : '');
            const body = selectedComponent.find((component) => component.type === 'BODY');
            setSelectedBodyText(body.text);
            const footer = selectedComponent.find((component) => component.type === 'FOOTER');
            setSelectedFooterText(footer ? footer.text : '');
            const headerHandle = header.example && header.example.header_handle ? header.example.header_handle[0] : '';
            const headerText = header.example && header.example.header_text ? header.example.header_text[0] : '';


            setApiurl1((prevApiurl1) => {
                return `${config.baseUrl}sent-messages/images?template_format=${findFormat(selectedComponent)}`;
            });

            // setApiurl2((prevApiurl2) => {
            //     if (headerHandle !== "") {
            //         return `${config.baseUrl}sent-messages/data/images?template_name=${name}&image_url=${headerHandle}&user_id=${userid}`;
            //     } else {
            //         return `${config.baseUrl}sent-messages/data/?template_name=${name}&user_id=${userid}`;
            //     }
            // });
        } else {
            setSelectedHeaderText('');
            setHeaderHandle('');
        }
    };
    const imageurl = config.imagebaseurl + headerHandle



    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!select) {
            alert('Please Select a Template for Messaging')
        }
        const numbers = phoneNumberInput.split(',').map((number) => number.trim());
        const postData = {
            "numbers": numbers,
            "template_name": select,
            "image_link": imageurl,
            "user_id": userid
        }
        try {
            const response = await axios.post(apiurl1, postData, { headers: headers });
            setPhoneNumberInput('')
            setSuccessMessage(true)
            setTimeout(() => {
                setSuccessMessage(false);
            }, 3000);

        } catch (error) {

        }
    };

    const handleSubmit2 = () => {

        setSuccessMessage(true)
        const numbers = phoneNumberInput.split(',').map((number) => number.trim());
        const data = {
            "numbers": numbers,
            "message": custommessage,
        }
        axios.post(`${config.baseUrl}custom-message/`, data, { headers: headers })
            .then((response) => {
                setPhoneNumberInput('')
                setCustommessage('')
                setTimeout(() => {
                    setSuccessMessage(false);
                }, 3000);

            })
            .catch((error) => {
                setSuccessMessage(false);
            })
    }




    const { data, loading } = TemplateApi();

    useEffect(() => {
        // axios.get(`${config.baseUrl}phone-numbers/?user_id=${userid}`, { headers: headers })
        //     .then((response) => {
        //         setNumberdata(response.data)
        //     })
        //     .catch((error) => {

        //     })


        setTemplateData(data.data)
    }, [data])

    return (
        <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
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
            <div className='h-full'>
                <WhatsappModule select={"sent-message"} />
            </div>
            <div className='flex-1 p-5 h-screen overflow-y-scroll'>
                <div className=' text-[#0d291a] text-4xl font-bold select-none'>Send WhatsApp Message Templates</div>
                <div className=' flex gap-10 mt-4'>
                    <div className={messagingbox ? 'cursor-pointer select-none py-1 px-2 text-lg bg-[#064A42] text-white rounded-md hover:shadow-xl' : 'cursor-pointer select-none py-1 px-2 text-lg bg-[white] rounded-md hover:shadow-xl'} onClick={() => { setMessagingbox(true); setPhoneNumberInput('') }}>Individual Messaging</div>
                    <div className={messagingbox ? 'cursor-pointer select-none py-1 px-2 text-lg bg-white rounded-md hover:shadow-xl' : 'cursor-pointer select-none py-1 px-2 text-lg bg-[#064A42] text-white rounded-md hover:shadow-xl'} onClick={() => { setMessagingbox(false); setPhoneNumberInput('') }}>Custom Messaging</div>
                </div>
                {messagingbox ?
                    <>
                        <div className=' flex justify-between px-10 mt-7 max-md:flex-col-reverse max-lg:flex-col-reverse max-sm:px-2'>
                            <div className=' flex flex-col gap-1 w-full'>

                                <div className=' text-base font-semibold'>Add Numbers to Send Messages</div>
                                <div className=' text-[10px] font-thin'>Separate Numbers with a Coma</div>
                                <div>
                                    <textarea
                                        type="text"
                                        name="" id=""
                                        className=' w-6/12 h-20 p-3'
                                        value={phoneNumberInput}
                                        onChange={(e) => setPhoneNumberInput(e.target.value)}
                                    />
                                </div>
                                <div onClick={handleSubmit} className='select-none cursor-pointer flex justify-center items-center bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold text-xs tracking-widest	'>
                                    <img className='h-6 object-contain' src={whatsapplogo} alt="" />
                                    &nbsp;Send Message
                                </div>
                            </div>
                            <div>
                                <div>Select Templates</div>
                                <select value={selectedName} onChange={handleSelectChange}>
                                    <option value="">Select a name</option>
                                    {templateData && templateData.names.map((item, index) => (
                                        <option key={index} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                                <div className="bg-[#262d31] text-gray-300 rounded-tr-lg  rounded-bl-lg rounded-br-lg mb-4 px-4 py-2 mt-4 w-[300px] overflow-hidden">
                                    <div className='font-bold'>{selectedHeaderText && selectedHeaderText}</div>
                                    {componentData && findFormat(componentData) === 'document' && (
                                        <iframe src={imageurl} title="document" />
                                    )}

                                    {componentData && findFormat(componentData) === 'image' && (
                                        <img src={imageurl} alt="Image" />
                                    )}
                                    {componentData && findFormat(componentData) === 'video' && (
                                        <video controls>
                                            <source src={imageurl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    )}

                                    <div className='text-[10px]'>
                                        {selectedBodyText && selectedBodyText}
                                    </div>
                                    <div className='font-thin text-xs'>{selectedFooterText && selectedFooterText}</div>
                                </div>
                            </div>
                        </div>
                    </> :
                    <>
                        <div className='flex justify-between px-10 mt-7 max-md:flex-col-reverse max-lg:flex-col-reverse max-sm:px-2'>
                            <div className=' flex flex-col gap-1 w-full'>
                                <div className=' text-base font-semibold'>Type a Message to Send</div>
                                <div>
                                    <textarea
                                        type="text"
                                        name="" id=""
                                        className=' w-6/12 h-20 p-3'
                                        value={custommessage}
                                        onChange={(e) => setCustommessage(e.target.value)}
                                    />
                                </div>
                                <div className=' text-base font-semibold'>Add Numbers to Send Messages</div>
                                <div className=' text-[10px] font-thin'>Separate Numbers with a Coma</div>
                                <div>
                                    <textarea
                                        type="text"
                                        name="" id=""
                                        className=' w-6/12 h-20 p-3'
                                        value={phoneNumberInput}
                                        onChange={(e) => setPhoneNumberInput(e.target.value)}
                                    />
                                </div>
                                <div onClick={handleSubmit2} className='select-none cursor-pointer flex justify-center items-center bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold text-xs tracking-widest	'>
                                    <img className='h-6 object-contain' src={whatsapplogo} alt="" />
                                    &nbsp;Send Message
                                </div>
                            </div>

                        </div>
                    </>}
                {successMessage && <div className="transition-all ease-in duration-1000 absolute w-full h-full bg-green-950/25 top-0 left-0 flex justify-center items-center">
                    <div className='w-2/6 bg-white rounded-lg flex flex-col items-center p-7'>
                        <div>
                            <img src={whatsappgif} alt="" className=' w-20' />
                        </div>
                        <div className=' text-green-800 font-semibold'>
                            Message has been sent Successfully
                        </div>

                    </div>

                </div>}
            </div>
        </div>
    )
}

export default Message