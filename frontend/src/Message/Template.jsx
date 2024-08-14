import React, { useEffect, useState } from 'react'
import axios from 'axios';
import CreateTemplate from './CreateTemplate';
import ImageTemplate from './ImageTemplate';
import { AiOutlineDelete } from 'react-icons/ai';
import Cookies from "js-cookie";
import config from '../config';
import WhatsappModule from '../WhatsappModule';
import { jwtDecode } from 'jwt-decode';
import Personalised from './Personalised';
import PersonalisedImageTemplate from './PersonalisedImageTemplate';
import TextTemplate from './TextTemplate';
import ImageTemplateNoButton from './ImageTemplateNoButton';
import Document from './Document';
import DocumentButton from './DocumentButton';
import Video from './Video';
import VideoButton from './VideoButton';
import useTemplateApi from '../Context/TemplatesApi';


function Template() {
    const [templates, setTemplates] = useState([]);
    const [page, setpage] = useState(null)
    const [create_template, setCreateTemplate] = useState(false)
    const [forceFetch, setForceFetch] = useState(false);
    const [createTemplateModal, setCreateTemplateModal] = useState(null);
    const [loading, setloading] = useState(false)
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;
    const ft = Cookies.get("ft")
    const basic_feature = jwtDecode(ft).basic_feature;
    const standard_feature = jwtDecode(ft).standard_feature;
    const advanced_feature = jwtDecode(ft).advanced_feature;




    const handleClick = (event) => {
        event.stopPropagation();
    };

    const handleDeleteClick = (templateName) => {
        // setSelectedTemplateName(templateName);

        DeleteApiCall()

    };
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }


    const DeleteApiCall = (templatename) => {
        setloading(true)
        const data = {}
        axios.post(`${config.baseUrl}delete/template?template_name="${templatename}"&user_id=${userid}`, data, { headers: headers })
            .then((response) => {

                setloading(false)
                GetTemplates()
                // setSelectedTemplateName(null)
            })
            .catch((error) => {
                setloading(false)

            })
    }

    const GetTemplates = (next) => {
        const apiurl = next
            ? `${config.baseUrl}get_templates/lists?user_id=${userid}&next=${next}`
            : `${config.baseUrl}get_templates/lists?user_id=${userid}`;

        axios.get(apiurl, { headers: headers })
            .then((response) => {
                const extractedData = response.data.data.map((template) => ({
                    id: template.id,
                    name: template.name,
                    status: template.status,
                    text: template.components.find((component) => component.type === 'HEADER')?.text || '',
                }));

                setTemplates((prevTemplates) => next ? [...prevTemplates, ...extractedData] : extractedData);
                setpage(response.data.paging);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }

    const { data } = useTemplateApi(forceFetch);

    useEffect(() => {
        GetTemplates()
    }, [createTemplateModal]);



    const [activeButton, setActiveButton] = useState(null);
    const handleMouseEnter = (buttonIndex) => {
        setTimeout(() => {
            setActiveButton(buttonIndex);
        }, 1000);
    };

    const handleMouseLeave = () => {
        setTimeout(() => {
            setActiveButton(null);
        }, 500);
    }
    const renderCreateTemplateModal = () => {
        switch (createTemplateModal) {
            case 'TextTemplate':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center items-center z-20' onClick={() => setCreateTemplateModal(null)}>
                        <TextTemplate handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            case 'TextTemplateWithButton':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20' onClick={() => setCreateTemplateModal(null)}>
                        <CreateTemplate handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            case 'PersonalisedTemplate':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20' onClick={() => setCreateTemplateModal(null)}>
                        <Personalised handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            case 'PersonalisedImageTemplate':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20' onClick={() => setCreateTemplateModal(null)}>
                        <PersonalisedImageTemplate handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            case 'ImageTemplate':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20 items-center' onClick={() => setCreateTemplateModal(null)}>
                        <ImageTemplateNoButton handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            case 'ImageTemplateWithButton':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20 items-center' onClick={() => setCreateTemplateModal(null)}>
                        <ImageTemplate handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            case 'DocumentTemplate':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20 items-center' onClick={() => setCreateTemplateModal(null)}>
                        <Document handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            case 'DocumentTemplateWithButton':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20 items-center' onClick={() => setCreateTemplateModal(null)}>
                        <DocumentButton handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            case 'VideoTemplate':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20 items-center' onClick={() => setCreateTemplateModal(null)}>
                        <Video handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            case 'VideoTemplateWithButton':
                return (
                    <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20 items-center' onClick={() => setCreateTemplateModal(null)}>
                        <VideoButton handleClick={handleClick} setCreateTemplateModal={setCreateTemplateModal} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
            <div className='h-full'>
                <WhatsappModule select={"template"} />
            </div>
            <div className='p-5 flex-1 h-screen overflow-y-scroll' onClick={() => {
                if (create_template == true) {
                    setCreateTemplate(false)
                }
            }}>
                <div className='flex items-center justify-between px-4'>
                    <div className=' text-[#0d291a] text-4xl font-bold select-none'>Message Templates</div>
                    <div className='relative'>
                        <div className=' bg-[#0d291a] text-white px-2 py-1 rounded-lg cursor-pointer select-none ' onClick={() => { setCreateTemplate(!create_template) }}>Create Template
                        </div>
                        {create_template &&
                            <div className=' bg-white absolute z-10 top-2 right-2 rounded-lg' onClick={handleClick}>
                                {basic_feature && <>
                                    <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('TextTemplate') }}>Text Template</li>
                                    <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onMouseEnter={() => handleMouseEnter(4)}
                                        onMouseLeave={handleMouseLeave}>Text Template with Button
                                        {activeButton === 4 && <div className='absolute bg-[#0d291a] left-[-220px] text-white text-[12px] px-2 py-1 w-[220px] rounded-lg shadow-md'>Upgrade Plan to Avail </div>}
                                    </li>
                                    <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100 relative' onMouseEnter={() => handleMouseEnter(1)}
                                        onMouseLeave={handleMouseLeave}>Image Template
                                        {activeButton === 1 && <div className='absolute bg-[#0d291a] left-[-220px] text-white text-[12px] px-2 py-1 w-[220px] rounded-lg shadow-md'>Upgrade Plan to Avail </div>}
                                    </li>
                                    <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100 relative' onMouseEnter={() => handleMouseEnter(5)}
                                        onMouseLeave={handleMouseLeave}>Image Template with Button
                                        {activeButton === 5 && <div className='absolute bg-[#0d291a] left-[-220px] text-white text-[12px] px-2 py-1 w-[220px] rounded-lg shadow-md'>Upgrade Plan to Avail </div>}
                                    </li>
                                    <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100 relative' onMouseEnter={() => handleMouseEnter(2)}
                                        onMouseLeave={handleMouseLeave}>Personalised Template
                                        {activeButton === 2 && <div className='absolute bg-[#0d291a] left-[-220px] text-white text-[12px] px-2 py-1 w-[220px] rounded-lg shadow-md'>Upgrade Plan to Avail </div>}
                                    </li>
                                    {/* <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100 relative' onMouseEnter={() => handleMouseEnter(3)}
                                        onMouseLeave={handleMouseLeave}>Personalised Image Template
                                        {activeButton === 3 && <div className='absolute bg-[#0d291a] left-[-220px] text-white text-[12px] px-2 py-1 w-[220px] rounded-lg shadow-md'>Upgrade Plan to Avail </div>}
                                    </li> */}
                                </>}
                                {standard_feature &&
                                    <>
                                        <ul class="flex flex-col gap-2 max-w-[280px] min-w-[280px] mx-auto text-xs">
                                            <li>
                                                <details class="group">
                                                    <summary
                                                        class="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                                        <span class="flex gap-2">
                                                            <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' >Normal Template</li>
                                                        </span>
                                                        <svg class="w-5 h-5 text-gray-500 transition group-open:rotate-90 duration-500" xmlns="http://www.w3.org/2000/svg"
                                                            width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path fill-rule="evenodd"
                                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                                            </path>
                                                        </svg>
                                                    </summary>

                                                    <article class="px-4 pb-4">
                                                        <ul class="flex flex-col ">
                                                            <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('TextTemplate') }}>Text Template</li>
                                                            <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('TextTemplateWithButton') }}>Text Template with Button</li>
                                                        </ul>
                                                    </article>
                                                </details>
                                            </li>
                                        </ul>
                                        <ul class="flex flex-col gap-2 max-w-[280px] min-w-[280px] mx-auto text-xs">
                                            <li>
                                                <details class="group">
                                                    <summary
                                                        class="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                                        <span class="flex gap-2">
                                                            <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' >Image Template</li>
                                                        </span>
                                                        <svg class="w-5 h-5 text-gray-500 transition group-open:rotate-90 duration-500" xmlns="http://www.w3.org/2000/svg"
                                                            width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path fill-rule="evenodd"
                                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                                            </path>
                                                        </svg>
                                                    </summary>

                                                    <article class="px-4 pb-4">

                                                        <ul class="flex flex-col ">
                                                            <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('ImageTemplate') }}>Image Template</li>
                                                            <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('ImageTemplateWithButton') }}>Image Template with Button</li>
                                                        </ul>

                                                    </article>

                                                </details>
                                            </li>
                                        </ul>
                                        <ul class="flex flex-col gap-2 max-w-[280px] min-w-[280px] mx-auto text-xs">
                                            <li>
                                                <details class="group">
                                                    <summary
                                                        class="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                                        <span class="flex gap-2">
                                                            <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' >Document Template</li>
                                                        </span>
                                                        <svg class="w-5 h-5 text-gray-500 transition group-open:rotate-90 duration-500" xmlns="http://www.w3.org/2000/svg"
                                                            width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path fill-rule="evenodd"
                                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                                            </path>
                                                        </svg>
                                                    </summary>

                                                    <article class="px-4 pb-4">
                                                        <ul class="flex flex-col ">
                                                            <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('DocumentTemplate') }}>Document Template</li>
                                                            <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('DocumentTemplateWithButton') }}>Document Template with Button</li>  </ul>
                                                    </article>

                                                </details>
                                            </li>
                                        </ul>
                                        <ul class="flex flex-col gap-2 max-w-[280px] min-w-[280px] mx-auto text-xs">
                                            <li>
                                                <details class="group">
                                                    <summary
                                                        class="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                                        <span class="flex gap-2">
                                                            <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100 relative' onMouseEnter={() => handleMouseEnter(2)}
                                                                onMouseLeave={handleMouseLeave}>Personalised Template
                                                                {activeButton === 2 && <div className='absolute bg-[#0d291a] left-[-220px] text-white text-[12px] px-2 py-1 w-[220px] rounded-lg shadow-md'>Upgrade Plan to Avail </div>}
                                                            </li>                                                    </span>
                                                        <svg class="w-5 h-5 text-gray-500 transition " xmlns="http://www.w3.org/2000/svg"
                                                            width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path fill-rule="evenodd"
                                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                                            </path>
                                                        </svg>
                                                    </summary>
                                                </details>
                                            </li>
                                        </ul>
                                    </>
                                }


                                {advanced_feature &&
                                    <>
                                        <>
                                            <ul class="flex flex-col gap-2 max-w-[280px] min-w-[280px] mx-auto text-xs">
                                                <li>
                                                    <details class="group">
                                                        <summary
                                                            class="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                                            <span class="flex gap-2">
                                                                <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' >Normal Template</li>
                                                            </span>
                                                            <svg class="w-5 h-5 text-gray-500 transition group-open:rotate-90 duration-500" xmlns="http://www.w3.org/2000/svg"
                                                                width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path fill-rule="evenodd"
                                                                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                                                </path>
                                                            </svg>
                                                        </summary>

                                                        <article class="px-4 pb-4">

                                                            <ul class="flex flex-col ">
                                                                <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => setCreateTemplateModal('TextTemplate')}>Text Template</li>
                                                                <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('TextTemplateWithButton') }}>Text Template with Button</li>
                                                            </ul>

                                                        </article>

                                                    </details>
                                                </li>
                                            </ul>
                                            <ul class="flex flex-col gap-2 max-w-[280px] min-w-[280px] mx-auto text-xs">
                                                <li>
                                                    <details class="group">
                                                        <summary
                                                            class="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                                            <span class="flex gap-2">
                                                                <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' >Image Template</li>
                                                            </span>
                                                            <svg class="w-5 h-5 text-gray-500 transition group-open:rotate-90 duration-500" xmlns="http://www.w3.org/2000/svg"
                                                                width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path fill-rule="evenodd"
                                                                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                                                </path>
                                                            </svg>
                                                        </summary>

                                                        <article class="px-4 pb-4">

                                                            <ul class="flex flex-col ">
                                                                <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('ImageTemplate') }}>Image Template</li>
                                                                <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('ImageTemplateWithButton') }}>Image Template with Button</li>
                                                            </ul>

                                                        </article>

                                                    </details>
                                                </li>
                                            </ul>
                                            <ul class="flex flex-col gap-2 max-w-[280px] min-w-[280px] mx-auto text-xs">
                                                <li>
                                                    <details class="group">
                                                        <summary
                                                            class="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                                            <span class="flex gap-2">
                                                                <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' >Video Template</li>
                                                            </span>
                                                            <svg class="w-5 h-5 text-gray-500 transition group-open:rotate-90 duration-500" xmlns="http://www.w3.org/2000/svg"
                                                                width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path fill-rule="evenodd"
                                                                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                                                </path>
                                                            </svg>
                                                        </summary>

                                                        <article class="px-4 pb-4">
                                                            <ul class="flex flex-col ">
                                                                <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('VideoTemplate') }}>Video Template</li>
                                                                <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('VideoTemplateWithButton') }}>Video Template with Button</li>  </ul>
                                                        </article>

                                                    </details>
                                                </li>
                                            </ul>
                                            <ul class="flex flex-col gap-2 max-w-[280px] min-w-[280px] mx-auto text-xs">
                                                <li>
                                                    <details class="group">
                                                        <summary
                                                            class="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                                            <span class="flex gap-2">
                                                                <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' >Document Template</li>
                                                            </span>
                                                            <svg class="w-5 h-5 text-gray-500 transition group-open:rotate-90 duration-500" xmlns="http://www.w3.org/2000/svg"
                                                                width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path fill-rule="evenodd"
                                                                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                                                </path>
                                                            </svg>
                                                        </summary>

                                                        <article class="px-4 pb-4">
                                                            <ul class="flex flex-col ">
                                                                <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('DocumentTemplate') }}>Document Template</li>
                                                                <li className='list-none text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('DocumentTemplateWithButton') }}>Document Template with Button</li>  </ul>
                                                        </article>

                                                    </details>
                                                </li>
                                            </ul>
                                            <ul class="flex flex-col gap-2 max-w-[280px] min-w-[280px] mx-auto text-xs">
                                                <li>
                                                    <details class="group">
                                                        <summary
                                                            class="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                                            <span class="flex gap-2">
                                                                <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100 relative' >Personalised Template
                                                                </li>                                                    </span>
                                                            <svg class="w-5 h-5 text-gray-500 transition  group-open:rotate-90 duration-500" xmlns="http://www.w3.org/2000/svg"
                                                                width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path fill-rule="evenodd"
                                                                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                                                </path>
                                                            </svg>
                                                        </summary>
                                                        <article class="px-4 pb-4">
                                                            <ul class="flex flex-col ">
                                                                <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('PersonalisedTemplate') }}>Personalised Template</li>
                                                                {/* <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setCreateTemplateModal('PersonalisedImageTemplate') }}>Personalised Image Template</li> */}
                                                            </ul>
                                                        </article>
                                                    </details>
                                                </li>
                                            </ul>
                                        </>
                                        {/* 
                                        <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setPersonalisedTemplate(true) }}>Personalised Template</li>
                                        <li className='list-none  text-center px-3 py-2 whitespace-nowrap select-none cursor-pointer hover:bg-slate-100' onClick={() => { setPersonalisedImageTemplate(true) }}>Personalised Image Template</li> */}
                                    </>
                                }


                            </div>}
                    </div>
                </div>
                <div>
                    {/* <table className="table-auto w-full mt-6 border border-gray-600"> */}
                    <table class="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Template Name
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Title
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Status
                                </th>
                                <th
                                    class="px-5 py-3 border-b-2 border-gray-200 bg-[#064A42] text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Delete Template
                                </th>
                            </tr>
                        </thead>

                        {/* <thead className='text-left bg-slate-500'>
                            <tr>
                                <th>Template Name</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Delete Template</th>
                            </tr>
                        </thead> */}
                        <tbody >
                            {templates.map((template) => (
                                <tr key={template.id} >
                                    {/* <tr> */}
                                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div class="flex items-center">
                                            <div class="ml-3">
                                                <p class="text-gray-900 whitespace-no-wrap">
                                                    {template.name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">{template.text}</p>
                                    </td>
                                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {template.status === "APPROVED" ? <span
                                            class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                            <span aria-hidden
                                                class="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                                            <span class="relative">{template.status}</span>
                                        </span> : <span
                                            class="relative inline-block px-3 py-1 font-semibold text-orange-900 leading-tight">
                                            <span aria-hidden
                                                class="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
                                            <span class="relative">{template.status}</span>
                                        </span>}

                                    </td>
                                    <td class="px-5 py-5 border-b border-gray-200 bg-white ">
                                        <span onClick={() => { DeleteApiCall(template.name) }}
                                            class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight cursor-pointer">
                                            <span aria-hidden
                                                class="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                                            <span class="relative">  <AiOutlineDelete /></span>
                                        </span>
                                        {/* <p class="text-gray-900 whitespace-no-wrap " >
                                          
                                        </p> */}
                                    </td>

                                </tr>

                            ))}
                        </tbody>
                    </table>
                    {page && <button className=' bg-[#0d291a] text-white px-2 py-1 rounded-lg cursor-pointer select-none float-right mt-2' onClick={() => { GetTemplates(page.cursors.after) }}>Load More</button>}
                </div>
            </div>
            {renderCreateTemplateModal()}

            {/* {normaltextTemplate &&
                <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center items-center z-20' onClick={() => { setnormaltextTemplate(false) }} >
                    <TextTemplate handleClick={handleClick} settextTemplate={setnormaltextTemplate} />
                </div>
            } */}
            {/* {textTemplate &&
                <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20' onClick={() => { settextTemplate(false) }} >
                    <CreateTemplate handleClick={handleClick} settextTemplate={settextTemplate} />
                </div>
            }
            {personalisedTemplate &&
                <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20' onClick={() => { setPersonalisedTemplate(false) }} >
                    <Personalised handleClick={handleClick} setPersonalisedTemplate={setPersonalisedTemplate} />
                </div>
            }
            {personalisedImageTemplate &&
                <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20' onClick={() => { setPersonalisedImageTemplate(false) }} >
                    <PersonalisedImageTemplate handleClick={handleClick} setPersonalisedImageTemplate={setPersonalisedImageTemplate} />
                </div>
            } */}
            {/* {imageTemplate &&
                <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20 items-center' onClick={() => { setimageTemplate(false) }} >
                  
                    <ImageTemplate handleClick={handleClick} setimageTemplate={setimageTemplate} />
                </div>
            }
            {imageTemplatenotbtn &&
                <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center z-20 items-center' onClick={() => { setimageTemplatenotbtn(false) }} >
                    <ImageTemplateNoButton handleClick={handleClick} setimageTemplate={setimageTemplatenotbtn} />
                </div>
            } */}
            {
                loading && <div className=' absolute w-full h-full top-0 left-0 flex justify-center z-20 items-center bg-black/40'>
                    <svg className='animate-spin' width="100px" height="100px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z" fill='#ffffff' />
                        </g>
                    </svg>
                </div>
            }
        </div >
    )
}

export default Template