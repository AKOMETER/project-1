import React, { useEffect, useState } from 'react'
import WhatsappModule from '../WhatsappModule'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import axios from 'axios'
import config from '../config'
import 'react-toastify/dist/ReactToastify.css';
import useTemplateApi from '../Context/TemplatesApi'
import AddContactGroup from './AddContactGroup'

function Contacts() {
    const [addcontact, setAddcontact] = useState()
    const [contact, setContact] = useState()
    const [data, setData] = useState()
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;

    const headers1 = {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + accessToken
    }

    function GetcontactGrps() {
        axios.get(`${config.baseUrl}contact-group/`, { headers: headers1 })
            .then((res) => { setData(res.data) })
            .catch((err) => { })
    }
    useEffect(() => {
        GetcontactGrps()
    }, [addcontact, contact])

    return (
        <>
            <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
                <div className='h-full'>
                    <WhatsappModule select={"contacts"} />
                </div>
                <div className='flex-1 p-5 h-screen overflow-y-scroll'>
                    <div className='flex justify-between'>
                        <h1 className=' text-[#0d291a] text-4xl font-bold select-none'>Contact Groups</h1>
                        <div className=' bg-[#0d291a] text-white px-2 py-1 rounded-lg cursor-pointer select-none ' onClick={() => { setAddcontact(true) }}>Add Contact Group
                        </div>

                    </div>
                    <div className='flex flex-wrap gap-4'>
                        {data && data.map((contact) => (
                            <>
                                <div className=' p-2 bg-white  rounded-md w-[300px]'>
                                    <h1 className=' text-lg font-bold'>{contact.name}</h1>
                                    <button className='select-none cursor-pointer bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase text-xs tracking-widest h-min float-right' onClick={() => { setContact(contact) }}>See Details</button>

                                </div>
                            </>
                        ))}
                    </div>
                </div>
            </div>
            {contact && <ContactGroup setContact={setContact} contact={contact} />}
            {addcontact && <AddContactGroup setAddcontact={setAddcontact} />}
        </>
    )
}

export default Contacts


function ContactGroup({ setContact, contact }) {
    const [templateData, setTemplateData] = useState();
    const [contactid, setContactid] = useState()
    const [editcontact, seteditcontact] = useState(false)
    const [selectedHeaderText, setSelectedHeaderText] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [selectedBodyText, setSelectedBodyText] = useState('')
    const [selectedFooterText, setSelectedFooterText] = useState('')
    const [select, setSelect] = useState('')
    const [headerHandle, setHeaderHandle] = useState('');
    const [apiurl1, setApiurl1] = useState();
    const [componentData, setcomponentData] = useState()
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
        } else {
            setSelectedHeaderText('');
            setHeaderHandle('');
        }
    };
    const { data, loading } = useTemplateApi();

    useEffect(() => {
        setTemplateData(data.data)
    }, [data])

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
    const imageurl = config.imagebaseurl + headerHandle

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!select) {
            alert('Please Select a Template for Messaging')
        }
        const numbers = contact.phone_numbers
        const postData = {
            "numbers": numbers,
            "template_name": select,
            "image_link": imageurl,
            "user_id": userid
        }
        try {
            const response = await axios.post(apiurl1, postData, { headers: headers });

            // setPhoneNumberInput('')


            setContact(false)

        } catch (error) {

        }
    };
    const HandleUpdate = async (e) => {
        setContactid(contact.id)
        seteditcontact(true)

    };
    const handleDelete = async (e) => {
        try {
            const response = await axios.delete(`${config.baseUrl}contact-group/${contact.id}/`, { headers: headers });
            setContact(false)
        } catch (error) {
        }
    };
    return (

        <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center items-center z-20' onClick={() => {
            setContact(false)
        }} >
            <div className='w-8/12 bg-white mt-10 p-10 rounded-xl max-h-full ' onClick={(e) => {
                e.stopPropagation()
            }} >
                <div className='flex justify-between'>
                    <div className=' text-[#0d291a] text-2xl font-bold select-none'>Contact Group - [{contact.name}]
                    </div>
                    <div>
                        <span className=' bg-[#0d291a] text-white text-xs px-2 py-1 rounded-lg cursor-pointer select-none w-min whitespace-nowrap font-light ' onClick={handleDelete} >Delete Group</span>
                        <span className=' bg-[#0d291a] text-white text-xs px-2 py-1 rounded-lg cursor-pointer select-none w-min whitespace-nowrap font-light ml-3' onClick={HandleUpdate} >Add Contact</span>
                    </div>

                </div>
                <div className='flex gap-2 flex-wrap mt-6 max-h-[300px] overflow-y-scroll'>
                    {contact.phone_numbers.map((number) => (
                        <div className='p-2 rounded-sm shadow-md shadow-neutral-200'>{number},</div>
                    ))}
                </div>
                <div className='flex w-min items-end mt-6'>
                    <div className='flex flex-col'>Select Templates
                        <select className='border border-gray-200' value={selectedName} onChange={handleSelectChange} >
                            <option value="">Select a name</option>
                            {templateData && templateData.names.map((item, index) => (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div className=' bg-[#0d291a] text-white text-xs px-2 py-1 rounded-lg cursor-pointer select-none w-min whitespace-nowrap font-light ' onClick={handleSubmit} >Sent Message</div>
                    </div>
                </div>
            </div>
            {editcontact && <AddContactGroup contact={contact} seteditcontact={seteditcontact} />}
        </div>
    )
}

// function AddContactGroup({ setAddcontact }) {
//     const [excelfile, setexcelfile] = useState(null);
//     const [input, setInput] = useState('');
//     const [fileName, setFileName] = useState('');
//     const accessToken = Cookies.get("accessToken")
//     const userid = jwtDecode(accessToken).user_id;

//     const headers1 = {
//         'Content-Type': 'multipart/form-data',
//         'Authorization': 'Bearer ' + accessToken
//     }

//     const handleFileChange = (event) => {
//         const selectedFile = event.target.files[0];
//         setexcelfile(selectedFile);
//         event.target.value = null
//     };

//     useEffect(() => {
//         if (excelfile) {
//             setFileName(excelfile.name);
//         } else {
//             setFileName('');
//         }
//     }, [excelfile]);

//     const handleSubmitExcelSent = async () => {

//         if (!excelfile) {
//             toast.error('Please select a file to upload.');
//             return;
//         }
//         if (!input) {
//             toast.error('Add Contact Name');
//             return;
//         }


//         const formData = new FormData();
//         formData.append('file', excelfile);
//         formData.append('user', userid)
//         formData.append('name', input)
//         // setSuccessMessage(true)
//         try {
//             // setTimeout(() => {
//             //     setSuccessMessage(false);
//             // }, 3000);
//             const response = await axios.post(`${config.baseUrl}contact-group/`, formData, { headers: headers1 });
//             setexcelfile('')
//             setInput('')
//             setAddcontact(false)
//             // setTimeout(() => {
//             //     setSuccessMessage(false);
//             // }, 3000);

//             // setSuccessMessage(false)
//         } catch (error) {
//             console.error('Error uploading file: ', error);
//             // setSuccessMessage(false)
//         }
//     };
//     return <>
//         <ToastContainer />
//         <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center items-center z-20' onClick={() => {
//             setAddcontact(false)
//         }} >
//             <div className='w-10/12 bg-white mt-10 p-10 rounded-xl    max-h-full ' onClick={(e) => {
//                 e.stopPropagation()
//             }} >
//                 <div className=' text-[#0d291a] text-2xl font-bold select-none'>Add Contact Group</div>
//                 <label className=' flex flex-col' htmlFor='header'>Contact Group Name
//                     <input type="text" placeholder='' onChange={(e) => { setInput(e.target.value) }} value={input} required id="header" className='lowercase border border-gray-400 rounded-md h-9 px-3'
//                     />
//                 </label>
//                 <div className='flex'>
//                     <label htmlFor="excel-file" className='mt-3 excel-bg-1 bg-white h-36 text-center rounded-xl flex flex-col border border-gray-300 w-[500px]'>
//                         Add Excel File to Upload Numbers to Contact Group
//                         <br />
//                         {excelfile ? fileName : ""}
//                         <input type="file" onChange={handleFileChange} id="excel-file" accept='.xlsx' className=' invisible' />
//                     </label>
//                     <span className='select-none cursor-pointer   bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold text-xs tracking-widest h-min mt-auto ml-2' onClick={handleSubmitExcelSent}>
//                         &nbsp;Create Contact Group
//                     </span>
//                 </div>

//             </div>


//         </div>
//     </>
// }