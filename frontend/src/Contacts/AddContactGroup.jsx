
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify'
import config from '../config';

function AddContactGroup({ setAddcontact, contact, seteditcontact }) {
    const [excelfile, setexcelfile] = useState(null);
    const [input, setInput] = useState(contact ? contact.name : '');
    const [fileName, setFileName] = useState('');
    const accessToken = Cookies.get("accessToken")
    const userid = jwtDecode(accessToken).user_id;

    const headers1 = {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + accessToken
    }
    console.log(contact)

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setexcelfile(selectedFile);
        event.target.value = null
    };

    useEffect(() => {
        if (excelfile) {
            setFileName(excelfile.name);
        } else {
            setFileName('');
        }
    }, [excelfile]);

    const handleSubmitExcelSent = async () => {

        if (!excelfile) {
            toast.error('Please select a file to upload.');
            return;
        }
        if (!input) {
            toast.error('Add Contact Name');
            return;
        }


        const formData = new FormData();
        formData.append('file', excelfile);
        formData.append('user', userid)
        formData.append('name', input)
        // setSuccessMessage(true)
        try {
            // setTimeout(() => {
            //     setSuccessMessage(false);
            // }, 3000);
            if (contact) {
                const response = await axios.put(`${config.baseUrl}contact-group/${contact.id}/`, formData, { headers: headers1 });
            } else {

                const response = await axios.post(`${config.baseUrl}contact-group/`, formData, { headers: headers1 });
            }
            setexcelfile('')
            setInput('')
            if (contact) {
                seteditcontact(false)
            } else {
                setAddcontact(false)
            }

        } catch (error) {
            console.error('Error uploading file: ', error);
            // setSuccessMessage(false)
        }
    };
    return <>
        <ToastContainer />
        <div className='absolute w-full h-full bg-black/30 top-0 left-0 flex justify-center items-center z-20' onClick={() => {
            { setAddcontact ? setAddcontact(false) : seteditcontact(false) }
        }} >
            <div className='w-10/12 bg-white mt-10 p-10 rounded-xl    max-h-full ' onClick={(e) => {
                e.stopPropagation()
            }} >
                <div className=' text-[#0d291a] text-2xl font-bold select-none'>Add Contact Group</div>
                <label className=' flex flex-col' htmlFor='header'>Contact Group Name
                    <input type="text" placeholder='' value={input} onChange={(e) => { setInput(e.target.value) }} required id="header" className='lowercase border border-gray-400 rounded-md h-9 px-3'
                    />
                </label>
                <div className='flex'>
                    <label htmlFor="excel-file" className='mt-3 excel-bg-1 bg-white h-36 text-center rounded-xl flex flex-col border border-gray-300 w-[500px]'>
                        Add Excel File to Upload Numbers to Contact Group
                        <br />
                        {excelfile ? fileName : ""}
                        <input type="file" onChange={handleFileChange} id="excel-file" accept='.xlsx' className=' invisible' />
                    </label>
                    <span className='select-none cursor-pointer   bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold text-xs tracking-widest h-min mt-auto ml-2' onClick={handleSubmitExcelSent}>
                        &nbsp;Create Contact Group
                    </span>
                </div>

            </div>


        </div>
    </>
}
export default AddContactGroup