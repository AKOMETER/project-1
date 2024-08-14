import React, { useEffect, useState } from 'react'
import Nav from '../Nav'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import config from '../config';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Editor from './MyEditor';

function BlogCreate() {
    const [value, setValue] = useState('');
    const [link, setLink] = useState('');
    const [blogid, setblogid] = useState()
    const [published, setpublished] = useState()
    const navigate = useNavigate()
    const accessToken = Cookies.get("accessToken")
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${config.baseUrl}blogs/`, {
                link,
                blog_content: value,
                published: false
            }, { headers: headers });

            setLink('');
            setValue('');
            navigate('/admin/blog')

        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };
    const EditBlog = async () => {
        try {
            const response = await axios.put(`${config.baseUrl}blogs/${blogid}/`, {
                link,
                blog_content: value,
                published: published
            }, { headers: headers });

            setLink('');
            setValue('');
            navigate('/admin/blog')

        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };
    const GetBlog = async (id) => {
        try {
            const response = await axios.get(`${config.baseUrl}blogs/${id}/`);

            setValue(response.data.blog_content)
            setLink(response.data.link)
            setpublished(response.data.published)
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const editId = searchParams.get('editid');
        setblogid(editId)
        if (editId) {
            GetBlog(editId)
        }
    }, [])


    return (
        <div className=" w-screen h-screen overflow-hidden bg-white ">
            <Nav />
            <div className='overflow-y-scroll h-full '>

                <div className='flex justify-between flex-1 p-5'>
                    <div className='text-3xl font-bold'>Create Blog</div>
                    <div className=' flex gap-4 items-center'>
                        {blogid ? <label htmlFor="togglepublish" className="flex items-center cursor-pointer bg-slate-200 max-w-max p-3 rounded-xl">
                            <span>Publish Blog</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="togglepublish"
                                    className="sr-only"
                                    checked={published}
                                    onChange={() => setpublished(!published)}
                                />
                                <div className="block bg-gray-500 w-14 h-8 rounded-full back-check"></div>
                                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                            </div>
                        </label> : ''}

                        <button className=' bg-[#0d291a] text-white px-2 py-1 rounded-lg cursor-pointer select-none h-fit' onClick={blogid ? EditBlog : handleSubmit}  >
                            {blogid ? 'Edit Blog' : 'Save Blog'}
                        </button>
                    </div>
                </div>
                <div className='flex justify-between flex-1 p-5'>
                    <div className="group relative w-72 md:w-80 lg:w-96">
                        <label for="2" className="block w-full pb-1 text-sm font-medium text-gray-500 transition-all duration-200 ease-in-out group-focus-within:text-blue-400">Add title of the Blog</label>
                        <input id="2"
                            placeholder="Link"
                            value={link}
                            onChange={(e) => {
                                const newLink = e.target.value.replace(/\s+/g, '-');
                                setLink(newLink);
                            }}
                            type="text" className="peer h-10 w-full rounded-md bg-gray-50 px-4 font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:ring-2 focus:ring-blue-400" />
                        <span className="absolute block pt-1 text-xs font-semibold text-gray-500 opacity-0 transition-all duration-200 ease-in-out group-focus-within:opacity-100">Text-format: xx-xxx</span>
                    </div>
                </div>
                {/* <ReactQuill
                    value={value}
                    onChange={setValue}
                    modules={modules}
                /> */}
                <Editor setValue={setValue} value={value} />
            </div>


        </div>
    )
}

export default BlogCreate