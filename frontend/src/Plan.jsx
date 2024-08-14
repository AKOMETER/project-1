import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { FaPaperPlane } from "react-icons/fa";
import { BiSolidPlaneAlt } from "react-icons/bi";
import { BsRocketTakeoffFill } from "react-icons/bs";
import { BsStars } from "react-icons/bs";
import logo from "./Icons/altoslogo.png";

function Plan() {
  const [rangeValue, setRangeValue] = useState(0);
  const [numberValue, setNumberValue] = useState(0);
  const [amount, setamount] = useState(0);
  const accessToken = Cookies.get("accessToken");
  const is_distributor =
    accessToken && jwtDecode(accessToken).user_is_distributor;
  const is_staff = accessToken && jwtDecode(accessToken).user_is_staff;

  // Handler function to update the range input value and calculate the result
  const handleRangeChange = (event) => {
    const value = parseFloat(event.target.value);
    setRangeValue(value);
    setNumberValue(value);
    setamount(parseFloat(value * 0.82).toFixed(2));
  };
  useEffect(() => {
    const href = window.location.href.substring(
      window.location.href.lastIndexOf("#") + 1
    );
    const element = document.getElementById(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  return (
    <div className=" w-screen h-[100%] overflow-hidden ">
      <div className="bg-[#083929] text-[#f0f0f0] flex justify-between px-16 py-4 max-sm:px-2 max-sm:text-sm">
        <div className=" px-5 w-[250px]">
          <img src={logo} alt="" className="w-full" />
        </div>
        <div className="flex items-center gap-6 text-sm font-medium max-sm:text-xs max-sm:gap-0">
          <div>
            <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg">
              <a href="/">Home</a>
            </button>
          </div>
          <div>
            {accessToken && (
              <a
                href={
                  is_staff
                    ? "/admin/messages"
                    : is_distributor
                      ? "/distributor/users"
                      : "/messages"
                }
              >
                <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg">
                  Go to Module
                </button>
              </a>
            )}

            {!accessToken && (
              <a href="/login">
                <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg">
                  Login | SignUp
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
      <section className="flex flex-col justify-center items-center gap-7 w-full text-center bg-[#afd5be] py-10 px-28 max-sm:px-4">
        <h2 className=" font-bold text-5xl p-5 px-20 leading-snug  text-[#221231] max-md:p-1 max-md:text-3xl max-sm:text-lg">
          Plan and Pricing
        </h2>
        <div className="flex justify-center w-full gap-4 max-sm:text-xs max-sm:gap-4 flex-wrap flex-1">
          <div className="bg-white p-4 px-16 flex flex-col items-center justify-between gap-3 rounded-xl pt-16 plan-box w-[300px] ">
            <ul className="flex items-center flex-col whitespace-nowrap gap-4 text-xs ">
              <span className="plan-icon text-center text-9xl text-[#205846] transition-all">
                <FaPaperPlane />
              </span>
              <div className=" text-2xl font-extrabold mt-5 whitespace-nowrap ">
                &#x20B9; 999
              </div>
              <div className=" text-2xl font-bold  whitespace-nowrap ">
                Basic Plan
              </div>
              <li className="flex gap-2">
                <BsStars />
                Unlimited agent logins
              </li>
              <li className="flex gap-2">
                <BsStars />
                Template message APIs
              </li>
              <li className="flex gap-2">
                <BsStars />
                Send bulk text message directly from pc
              </li>
              <li className="flex gap-2">
                <BsStars />
                Import contacts from excel sheet
              </li>
            </ul>
            {/* <Link to="/plan-and-pricing" type="button" className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center ">
                            More Details
                            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                        </Link> */}
          </div>
          <div className="bg-white p-4 px-16 flex flex-col items-center justify-between gap-3 rounded-xl pt-16 plan-box w-[300px]">
            <ul className="flex items-center flex-col whitespace-nowrap gap-2 text-xs">
              <span className="plan-icon text-center text-9xl text-[#205846]">
                <BiSolidPlaneAlt />
              </span>
              <div className=" text-2xl font-extrabold mt-5 whitespace-nowrap ">
                &#x20B9; 1999
              </div>
              <div className=" text-2xl font-bold whitespace-nowrap ">
                Standard Plan
              </div>
              <li className="flex gap-2">
                <BsStars />
                Unlimited agent logins
              </li>
              <li className="flex gap-2">
                <BsStars />
                Template message APIs
              </li>
              <li className="flex gap-2">
                <BsStars />
                Send bulk text message directly from pc
              </li>
              <li className="flex gap-2">
                <BsStars />
                Import contact from excel sheet
              </li>
              <li className="flex gap-2">
                <BsStars />
                Attach files, image or high resolution video
              </li>
              <li className="flex gap-2">
                <BsStars />
                Button message sending
              </li>
              <li className="flex gap-2">
                <BsStars />
                Can send attachments
              </li>
            </ul>
            {/* <Link to="/plan-and-pricing" type="button" className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center ">
                            More Details
                            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                        </Link> */}
          </div>
          <div className="bg-white p-4 px-16 flex flex-col items-center justify-between gap-3 rounded-xl pt-16 plan-box w-[300px]">
            <ul className="flex items-center flex-col whitespace-nowrap gap-2 text-xs">
              <span className="plan-icon text-center text-9xl text-[#205846]">
                <BsRocketTakeoffFill />
              </span>
              <div className=" text-2xl font-extrabold mt-5 whitespace-nowrap ">
                &#x20B9; 2999
              </div>
              <div className=" text-2xl font-bold  whitespace-nowrap ">
                Advanced Plan
              </div>
              <li className="flex gap-2">
                <BsStars />
                Unlimited agent logins
              </li>
              <li className="flex gap-2">
                <BsStars />
                Template message APIs
              </li>
              <li className="flex gap-2">
                <BsStars />
                Send bulk text message directly from pc
              </li>
              <li className="flex gap-2">
                <BsStars />
                Import contact from excel sheet
              </li>
              <li className="flex gap-2">
                <BsStars />
                Attach files, image or high resolution video
              </li>
              <li className="flex gap-2">
                <BsStars />
                Button message sending
              </li>
              <li className="flex gap-2">
                <BsStars />
                Can send attachments
              </li>
              <li className="flex gap-2">
                <BsStars />
                Smart audience segmentation
              </li>
              <li className="flex gap-2">
                <BsStars />
                Broadcasting and retargeting
              </li>
              <li className="flex gap-2">
                <BsStars />
                Downloadable reports
              </li>
            </ul>

           
                            More Details
                            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>

          </div>
        </div>
      </section >
      <section
        id="calculator"
        className="flex flex-col justify-center items-center gap-7 w-full text-center bg-[#afd5be] py-10 px-28 max-sm:px-4"
      >
        <h2 className=" font-bold text-5xl p-5 px-20 leading-snug  text-[#221231] max-md:p-1 max-md:text-3xl max-sm:text-lg">
          Meta Messaging Calculator
        </h2>
        <div className="flex flex-col items-center w-full gap-4 max-sm:text-xs max-sm:gap-4 flex-wrap flex-1 bg-white rounded-xl p-7">
          <span className="accordion-button">
            <div className="flex flex-col gap-4">
              <p className="text-3xl text-[#221231] font-bold">
                Marketing Messages
              </p>
              <p className="copy-small accordion-subtitle">
                <span className=" text-2xl font-semibold">{numberValue}</span>{" "}
                Messages ={" "}
                <span className="text-2xl font-semibold">
                  &#x20B9; {amount}
                </span>
              </p>
            </div>
          </span>
          <div className="flex items-center justify-center flex-wrap w-full">
            <label htmlFor="inputRange" className="w-full">
              <input
                type="range"
                id="inputRange"
                step="100"
                min="0"
                max="10000"
                className="win10-thumb w-full"
                value={rangeValue}
                onChange={handleRangeChange}
              />
            </label>
            <label htmlFor="inputNumber">
              <input
                type="number"
                className="w-[80px] pl-4 "
                id="inputNumber"
                step="1"
                value={numberValue}
                onChange={handleRangeChange}
              />
              Messages
            </label>
          </div>
        </div>
      </section>
      <section>
        <div className="footer-2 bg-gray-800 pt-6 md:pt-12">
          <div className="container px-4 mx-auto">
            <div className="md:flex md:flex-wrap md:-mx-4 py-6 md:pb-12">
              <div className="footer-info lg:w-1/3 md:px-4">
                <h4 className="text-white text-2xl mb-4">ALTOS CONNECT</h4>
                <p className="text-gray-400">
                  Empower your WhatsApp marketing strategy with Alt WhatsApp's
                  cutting-edge automation tools. Streamline messaging,
                  scheduling, and customer interactions effortlessly, saving
                  time and enhancing efficiency.
                </p>
                <div className="mt-4">
                  {/* <button className="bg-facebook py-2 px-4 text-white rounded mt-2 transition-colors duration-300">
                                        <span className="fab fa-facebook-f mr-2"></span> Follow
                                    </button>
                                    <button className="bg-twitter py-2 px-4 text-white rounded ml-2 mt-2 transition-colors duration-300">
                                        <span className="fab fa-twitter mr-2"></span> Follow @freeweb19
                                    </button> */}
                </div>
              </div>

              <div className="md:w-2/3 lg:w-1/3 md:px-4 xl:pl-16 mt-12 lg:mt-0">
                <div className="sm:flex">
                  {/* <div className="sm:flex-1">
                                        <h6 className="text-base font-medium text-white uppercase mb-2">About</h6>
                                        <div>
                                            <a href="#" className="text-gray-400 py-1 block hover:underline">Company</a>
                                            <a href="#" className="text-gray-400 py-1 block hover:underline">Culture</a>
                                            <a href="#" className="text-gray-400 py-1 block hover:underline">Team</a>
                                            <a href="#" className="text-gray-400 py-1 block hover:underline">Careers</a>
                                        </div>
                                    </div> */}
                  <div className="sm:flex-1 mt-4 sm:mt-0">
                    {/* <h6 className="text-base font-medium text-white uppercase mb-2">What we offer</h6> */}
                    <div>
                      <a
                        href="#contact"
                        className="text-gray-400 py-1 block hover:underline"
                      >
                        Contact
                      </a>
                      <a
                        href="#pricing"
                        className="text-gray-400 py-1 block hover:underline"
                      >
                        Pricing
                      </a>
                      <a
                        href="https://altostechnologies.in/"
                        target="_blank"
                        className="text-gray-400 py-1 block hover:underline"
                      >
                        Company
                      </a>
                      <a
                        href="#started"
                        className="text-gray-400 py-1 block hover:underline"
                      >
                        Get Started
                      </a>
                      <Link
                        to="/plan-and-pricing#calculator"
                        className="text-gray-400 py-1 block hover:underline"
                      >
                        Pricing Calculator
                      </Link>
                      <Link
                        to="/newsletter"
                        className="text-gray-400 py-1 block hover:underline"
                      >
                        Newsletter
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-1/3 md:px-4 md:text-center mt-12 lg:mt-0">
                <h5 className="text-lg text-white font-medium mb-4">
                  Explore our site
                </h5>
                <button className="bg-indigo-600 text-white hover:bg-indigo-700 rounded py-2 px-6 md:px-12 transition-colors duration-300">
                  Explore
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-solid border-gray-900 mt-4 py-4">
            <div className="container px-4 mx-auto">
              <div className="md:flex md:-mx-4 md:items-center">
                <div className="md:flex-1 md:px-4 text-center md:text-left">
                  <p className="text-white">
                    &copy; <strong>FWR</strong>
                  </p>
                </div>
                <div className="md:flex-1 md:px-4 text-center md:text-right">
                  <a
                    href="#"
                    className="py-2 px-4 text-white inline-block hover:underline"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="py-2 px-4 text-white inline-block hover:underline"
                  >
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div >
  );
}

export default Plan;
