import React from 'react'
import image from '../Icons/bgnotfound.png'
import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <div className=' w-11/12 bg-[#064A42] flex justify-between  items-center h-screen  rounded-2xl overflow-x-auto px-24'>
            <div className='flex-1'><img className='animate-pulse' src={image} alt="" /></div>
            <div className='text-white flex-1 flex items-center flex-col gap-3' >
                <h1 className='text-9xl animate-pulse'>404</h1>
                <div>Sorry, This Page is not Available</div>
                <Link to='/' className='p-2 bg-white text-[#064A42] hover:text-white hover:bg-[#064A42] border border-white rounded-lg text-[12px]'>Go to Home</Link>
            </div>
        </div>
    )
}

export default NotFound