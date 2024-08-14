import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Nav from '../Nav';
import axios from 'axios';
import config from '../config';
import Cookies from 'js-cookie';
import 'react-quill/dist/quill.snow.css';

function BlogPage() {
    const { id, title } = useParams();
    const [data, setdata] = useState()

    const accessToken = Cookies.get("accessToken")
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
    const GetBlogs = async () => {
        try {
            const response = await axios.get(`${config.baseUrl}blogs/${id}/`);

            setdata(response.data)
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };
    useEffect(() => {
        GetBlogs()

    }, [])



    return (
        <div className=" w-screen overflow-hidden bg-white ">
            <Nav></Nav>

            {data &&
                <div className='ql-container  px-20 max-md:px-4 '>
                    <div className='ql-editor'>
                        <div className='text-justify-around font-serif' dangerouslySetInnerHTML={{ __html: data.blog_content }} />
                    </div>
                </div>
            }


        </div>
    )
}

export default BlogPage