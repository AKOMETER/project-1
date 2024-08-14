import React, { useEffect, useState } from 'react'
import Nav from '../Nav'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import Cookies from 'js-cookie';

function Blog() {
    const [data, setdata] = useState()

    const GetBlogs = async () => {
        try {
            const response = await axios.get(`${config.baseUrl}blogs/published/`);

            setdata(response.data)
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };

    useEffect(() => {
        GetBlogs()
    }, [])
    return (
        <div className=" w-screen h-screen overflow-hidden bg-white ">
            <Nav></Nav>
            <div className='flex flex-wrap gap-10 p-5'>

                {data && data.map((blog) => (
                    <div class="bg-white rounded-lg shadow-lg w-[400px]">
                        <div class="p-6">
                            <h2 class="font-bold mb-2 text-xl ">{blog.link}
                            </h2>
                            <Link to={`/blog/${blog.id}/${blog.link}`} target='_blank' class="text-purple-600 hover:text-purple-500 underline text-sm float-right">See Blog 👉</Link>
                        </div>
                    </div>
                ))}

            </div>


        </div >
    )
}

export default Blog