import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Cookies from "js-cookie";
import config from '../config';
import { jwtDecode } from 'jwt-decode';

function Login() {
    const [login, setLogin] = useState(true)
    const [register, setRegister] = useState()
    const [lemail, setlemail] = useState('')
    const [lpassword, setlpassword] = useState('')
    const [semail, setsemail] = useState('')
    const [referralstring, setReferralstring] = useState('')
    const [signupmessage, setsignupmessage] = useState(false)
    const [errormesssage, seterrormesssage] = useState(false)
    const [errormesssagel, seterrormesssagel] = useState(false)
    const [loading, setloading] = useState(false)
    const [referralInput, setReferralInput] = useState()
    const [referbox, setReferbox] = useState()
    // register
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [referral_string, setReferralCode] = useState('ALTOS12');
    const navigate = useNavigate()
    const ldata = {
        "email": lemail,
        "password": lpassword
    }
    const HandleLogin = () => {
        axios.post(`${config.baseUrl}login/`, ldata)
            .then((response) => {
                console.log("Response received:", response);
    
                if (response && response.data) {
                    const accessToken = response.data?.token?.access;
                    const featuretoken = response.data?.feature_token;
    
                    console.log("Access Token:", accessToken);
                    console.log("Feature Token:", featuretoken);
    
                    if (accessToken) {
                        Cookies.set("accessToken", accessToken, { expires: 5, sameSite: 'None', secure: true });
    
                        const decodedToken = jwtDecode(accessToken);
                        console.log("Decoded Token:", decodedToken);
    
                        const is_staff = decodedToken?.user_is_staff;
                        const is_distributor = decodedToken?.user_is_distributor;
    
                        console.log("Is Staff:", is_staff);
                        console.log("Is Distributor:", is_distributor);
    
                        if (is_staff) {
                            navigate('/admin/messages');
                        } else if (is_distributor) {
                            navigate('/distributor/users');
                        } else {
                            navigate('/messages');
                        }
                    } else {
                        console.error("Access token is missing in the response.");
                    }
    
                    if (featuretoken) {
                        Cookies.set("ft", featuretoken, { expires: 5, sameSite: 'None', secure: true });
                    } else {
                        console.error("Feature token is missing in the response.");
                    }
                } else {
                    console.error("Response data is missing.");
                }
            })
            .catch((error) => {
                console.error("An error occurred:", error);
    
                if (error.response && error.response.data && error.response.data.message) {
                    seterrormesssagel(error.response.data.message);
                } else {
                    seterrormesssagel('An unexpected error occurred. Please try again later.');
                }
            });
    };
    
    


    // const sdata = {
    //     "email": semail,
    //     "referral_string": referralstring ? referralstring : "ALTOS12"
    // }

    const [validationErrors, setValidationErrors] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        company: '',
        referral_string: '',
    });

    const validateForm = () => {
        const errors = {};


        // Validation for registration fields
        if (!first_name.trim()) {
            errors.first_name = 'Please enter your first name.';
        }

        if (!last_name.trim()) {
            errors.last_name = 'Please enter your last name.';
        }

        if (!phone.trim()) {
            errors.phone = 'Please enter your phone number.';
        } else {
            if (!/^\d+$/.test(phone)) {
                errors.phone = 'Please enter a valid phone number with only numbers.';
            }
            if (phone.length > 12) {
                errors.phone = 'Phone number must be exactly 12 digits.';
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address.';
        }

        // Validation for company registration fields
        if (!company.trim()) {
            errors.company = 'Please enter your company name.';
        }

        if (referralInput && !referral_string.trim()) {
            errors.referral_string = 'Please enter your referral code.';
        }


        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const HandleSignUp = (e) => {
        e.preventDefault()
        if (validateForm()) {
            const formData = {
                "first_name": first_name,
                "last_name": last_name,
                "phone": phone,
                "email": email,
                "company_name": company,
                "referral_string": referral_string,
                "trial_plan": referralInput
            };

            setloading(true)
            axios.post(`${config.baseUrl}register/`, formData)
                .then((response) => {

                    setsignupmessage(true)
                    setloading(false)
                    setFirstName('')
                    setLastName('')
                    setPhone('')
                    setEmail('')
                    setCompany('')
                    // navigate('/messages')
                }).catch((error) => {

                    if (error.response.data.email) {
                        seterrormesssage(true)
                        setloading(false)
                    }
                })
        }
    }

    return (
        <div className='flex flex-col items-center justify-center w-full gap-3 background-doodle h-[100dvh] '>
            {/* <div className='flex justify-around w-2/6 bg-[#ffffff] rounded-lg relative max-md:w-2/4 max-sm:w-10/12'>
                <div onClick={() => { setLogin(true) }} className='cursor-pointer w-full text-center  select-none'>Login</div>
                <div onClick={() => { setLogin(false) }} className='cursor-pointer w-full text-center select-none'>Signup</div>
                <div className={login ? 'absolute w-3/6 bg-[#064A42] mix-blend-multiply rounded-lg left-0 shadow-lg select-none ' : 'absolute w-3/6 bg-[#064A42] mix-blend-multiply rounded-lg right-0 select-none shadow-lg '}>&nbsp;</div>
            </div> */}

            <div className="font-sans antialiased w-5/10">
                <div className="w-full bg-grey-lightest pt-14" >
                    {login ? <>
                        <div className="container mx-auto py-8">
                            <div className=" mx-auto min-w-min  bg-white rounded shadow   ">
                                <div className="py-4 px-12 text-black text-center text-xl border-b border-grey-lighter whitespace-nowrap">Log In to Altos Connect</div>
                                <div className="py-4 px-8">
                                    <div className="mb-4">
                                        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="email">Email Address</label>
                                        <input className="appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="email" type="email" placeholder="Your email address" value={lemail} onChange={(e) => { setlemail(e.target.value) }} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="password">Password</label>
                                        <input className="appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="password" type="password" placeholder="Enter Password" value={lpassword} onChange={(e) => { setlpassword(e.target.value) }} />
                                    </div>
                                    {errormesssagel
                                        && <div className='text-xs text-center whitespace-nowrap font-semibold text-red-500'>{errormesssagel}</div>
                                    }

                                    <div className="flex items-center justify-end mt-8">
                                        <button className="bg-blue hover:bg-blue-dark bg-green-950 text-white font-bold py-2 px-4 rounded-full" type="submit" onClick={HandleLogin}>
                                            Login &#x279C;
                                        </button>
                                    </div>
                                    <p className="text-center text-green-950 mb-4">
                                        <button onClick={() => { setLogin(false) }} className="text-grey-dark text-sm no-underline hover:text-grey-darker whitespace-nowrap">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I am new here. Sign me Up&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                        :
                        <form className="container mx-auto py-8" onSubmit={HandleSignUp}>
                            <div className="w-5/6 lg:w-5/6 mx-auto  bg-white rounded shadow   ">
                                <div className="py-4 px-8 text-black text-center text-xl border-b border-grey-lighter whitespace-nowrap">Register to Altos Connect</div>

                                <div className="py-4 px-8">
                                    <div className="flex mb-4">
                                        <div className="w-1/2 mr-1">
                                            <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="first_name">First Name</label>
                                            <input className="appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="first_name" type="text" placeholder="Your first name" value={first_name} onChange={(e) => setFirstName(e.target.value)} />

                                            <div className="text-red-500 text-[10px] text-center">
                                                {validationErrors.first_name && <p>{validationErrors.first_name}</p>}</div>
                                        </div>
                                        <div className="w-1/2 ml-1">
                                            <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="last_name">Last Name</label>
                                            <input className="appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="last_name" type="text" placeholder="Your last name" value={last_name} onChange={(e) => setLastName(e.target.value)} />
                                            <div className="text-red-500 text-[10px] ">
                                                {validationErrors.last_name && <p>{validationErrors.last_name}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="phone">Phone Number</label>
                                        <input className="appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="phone" type="tel" placeholder="Your Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        <div className="text-red-500 text-[10px] ">
                                            {validationErrors.phone && <p>{validationErrors.phone}</p>}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="email">Email Address</label>
                                        <input className="appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="email" type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        <div className="text-red-500 text-[10px] ">
                                            {validationErrors.email && <p>{validationErrors.email}</p>}
                                        </div>
                                    </div>

                                    {/* <div className="flex items-center justify-end mt-8">
                                        <button className="bg-blue hover:bg-blue-dark bg-green-950 text-white font-bold py-2 px-4 rounded-full"
                                            type="button"
                                            onClick={() => { setRegister(false) }}
                                        >
                                            Next &#x290D;
                                        </button>
                                    </div> */}
                                    <div className="mb-4">
                                        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="company">Company Name</label>
                                        <input className="appearance-none border rounded  py-2 px-3 text-grey-darker w-full" id="company" type="text" placeholder="Your company name" value={company} onChange={(e) => setCompany(e.target.value)} />
                                        <div className="text-red-500 text-[10px] ">
                                            {validationErrors.company && <p>{validationErrors.company}</p>}
                                        </div>

                                    </div>
                                    <div className="flex mb-4 ">
                                        <div className={referralInput ? " w-1/2 mr-1" : ""}>
                                            <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="company">Choose a Plan to Continue</label>
                                            <select className="appearance-none border rounded w-full py-2 px-3 text-grey-darker" required id="company" onChange={(e) => {
                                                setReferralInput(e.target.value);
                                            }}>
                                                <option value="" hidden>Select a Plan</option>
                                                <option value="basic">Basic Plan</option>
                                                <option value="standard">Standard Plan</option>
                                                <option value="advanced">Advanced Plan</option>
                                            </select>
                                        </div>
                                        {/* {referbox &&
                                            <div className=" w-1/2 mt-5">
                                                <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="referral">Referral Code</label>
                                                <input className="appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="referral" type="text" placeholder="Your referral code" onChange={(e) => setReferralCode(e.target.value)} />
                                                <div className="text-red-500 text-[10px] text-center">
                                                    // {validationErrors.referral_string && <p>{validationErrors.referral_string}</p>}
                                                </div>
                                            </div>

                                        } */}
                                    </div>
                                    {errormesssage
                                        && <div className='text-xs text-center whitespace-nowrap font-semibold text-red-500'>Email already Exists</div>
                                    }
                                    {signupmessage
                                        && <div className='text-xs text-center whitespace-nowrap'>A Generated password will be received <br></br>in your <a className='text-blue-700 underline' href='https://mail.google.com/mail/' target='_blank'>email inbox</a> </div>
                                    }

                                    <div className="flex items-center justify-end ">

                                        <button className="bg-blue hover:bg-blue-dark bg-green-950 text-white font-bold py-2 px-4 rounded-full"
                                            type="submit"
                                        // onClick={HandleSignUp}
                                        >
                                            Sign Up &#x290D;
                                        </button>
                                    </div>
                                </div>


                                <p className="text-center text-green-950 mb-4 pb-6">
                                    <button onClick={() => { setLogin(true) }} className="text-grey-dark text-sm no-underline hover:text-grey-darker">I already have an account. <span>Log In</span></button>
                                </p>
                            </div>
                        </form>

                        // <div className='w-2/6 bg-[#cfe7e1] rounded-lg max-md:w-2/4 max-sm:w-10/12'>
                        //     <div className=' flex flex-col px-10 py-5 gap-5'>
                        //         <div className='text-center font-bold text-2xl'>SignUp</div>
                        //         <label htmlFor='email' className=' flex flex-col gap-2 text-sm'>Email
                        //             <input type="email" name="" id="email" className='border border-gray-500 pl-3 h-7' value={semail} onChange={(e) => { setsemail(e.target.value) }} />
                        //         </label>
                        //         <label htmlFor='refer' className=' flex flex-col gap-2 text-xs'>Referral code
                        //             <input type="text" placeholder='referral code' name="refer" id="refer" autoComplete="off" className='border border-gray-500 pl-3 h-7 uppercase' value={referralstring} onChange={(e) => { setReferralstring(e.target.value) }} />
                        //         </label>
                        //         {signupmessage
                        //             && <div className='text-xs text-center whitespace-nowrap'>A Generated password will be received <br></br>in your <a className='text-blue-700 underline' href='https://mail.google.com/mail/' target='_blank'>email inbox</a> </div>
                        //         }
                        //         {errormesssage
                        //             && <div className='text-xs text-center whitespace-nowrap font-semibold text-red-500'>Email already Exists</div>
                        //         }
                        //         {/* <label htmlFor='email' className=' flex flex-col gap-2 text-sm'>Password
                        //             <input type="password" name="" id="" className='border border-gray-500 pl-3 h-7' value={spassword} onChange={(e) => { setspassword(e.target.value) }} />
                        //         </label> */}
                        //         {/* <label htmlFor='email' className=' flex flex-col gap-2 text-sm'>Confirm Password
                        //             <input type="password" name="" id="" className='border border-gray-500 pl-3 h-7' />
                        //         </label> */}
                        //         <div className=' bg-[#064A42] text-center select-none cursor-pointer text-white rounded-md' onClick={HandleSignUp}>
                        //             SignUp
                        //         </div>
                        //     </div>
                        // </div>
                    }
                </div>
            </div>
            {
                loading && <div className=' absolute w-full h-full top-0 left-0 flex justify-center items-center bg-black/40'>
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

export default Login