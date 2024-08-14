import React, { useEffect, useState } from 'react'
import AdminWhatsappModule from './AdminWhatsappModule'
import { Link, useNavigate } from 'react-router-dom'
import config from '../config';
import axios from 'axios';
import { MdDelete, MdEditSquare } from "react-icons/md";
import Cookies from 'js-cookie';

function AdminBlog() {
    const [data, setdata] = useState()
    const navigate = useNavigate()
    const accessToken = Cookies.get("accessToken")
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }

    const GetBlogs = async () => {
        try {
            const response = await axios.get(`${config.baseUrl}blogs/`, { headers: headers });

            setdata(response.data)
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };
    const DeleteBlog = async (id) => {
        try {
            const response = await axios.delete(`${config.baseUrl}blogs/${id}/`, { headers: headers });

            setdata(response.data)
            GetBlogs()
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };
    const EditBlog = (id) => {
        navigate(`/admin/blog/create/?editid=${id}`)

    };

    useEffect(() => {
        GetBlogs()
    }, [])


    return (
        <>
            <div className=' w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto'>
                <div className='h-full'>
                    <AdminWhatsappModule select={"admin_blog"} />
                </div>

                <div className=' flex-1 p-5 '>
                    <div className='flex justify-between'>
                        <div className='text-3xl font-bold'>Create Blog</div>
                        <div className=' bg-[#0d291a] text-white px-2 py-1 rounded-lg cursor-pointer select-none h-fit' onClick={() => { navigate('/admin/blog/create') }} >Create Blog
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-10'>

                        {data && data.map((blog) => (
                            <div class="bg-white rounded-lg shadow-lg w-[300px] relative">
                                <div class="p-6">
                                    <h2 class="font-bold mb-2 text-xl text-purple-800">{blog.link}
                                    </h2>
                                    <Link to={`/blog/${blog.id}/${blog.link}`} target='_blank' class="text-purple-600 hover:text-purple-500 underline text-sm">See Blog 👉</Link>
                                </div>

                                <button onClick={() => { EditBlog(blog.id) }}>
                                    <MdEditSquare className='text-xl absolute right-14 bottom-6' />
                                </button>
                                <button onClick={() => { DeleteBlog(blog.id) }}>
                                    <MdDelete className='text-xl absolute right-6 bottom-6' />
                                </button>

                            </div>
                        ))}

                    </div>
                    {/* {data &&
                        <div className='ql-container'>
                            <div className='ql-editor'>

                                <div dangerouslySetInnerHTML={{ __html: data.blog_content }} />
                            </div>

                        </div>
                    } */}
                </div>
            </div>
        </>
    )
}

export default AdminBlog