import React, { useEffect, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { BiSolidPlaneAlt } from "react-icons/bi";
import { BsRocketTakeoffFill } from "react-icons/bs";
import { BsStars } from "react-icons/bs";
import json from "./Icons/CountryCodes.json";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import config from "./config";
import logo from "./Icons/altoslogo.png";
import CookieConsent from "./CookieConsent";
import { MdOutlineMailOutline } from "react-icons/md";
import Nav from "./Nav";
function Landing() {
  const accessToken = Cookies.get("accessToken") || "";
  const [options, setOptions] = useState();
  const is_distributor =
    accessToken && jwtDecode(accessToken).user_is_distributor;
  const is_staff = accessToken && jwtDecode(accessToken).user_is_staff;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCode, setSelectedCode] = useState();
  const [phone, setPhone] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const navigate = useNavigate();

  const handleNewsletter = () => {
    navigate("/newsletter")
  }

  useEffect(() => {
    setOptions(json);
  }, []);
  useEffect(() => {
    const href = window.location.href.substring(
      window.location.href.lastIndexOf("#") + 1
    );
    const element = document.getElementById(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data to be sent in the request
    const formData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      code: selectedCode,
      phone,
      issue_description: issueDescription,
    };

    try {
      const response = await axios.post(
        `${config.baseUrl}contact-form/`,
        formData
      );

      setFirstName("");
      setEmail("");
      setFirstName("");
      setLastName("");
      setIssueDescription("");
      setPhone("");
    } catch (error) {
      console.error("Error submitting the form:", error);
    }
  };

  return (
    <div className=" w-screen h-[100%] overflow-hidden ">
      {/* <CookieConsent /> */}
      {/* <div className="bg-[#083929] text-[#f0f0f0] flex justify-between px-16 py-4 max-sm:px-2 max-sm:text-sm">
        <div className=" px-5 w-[250px]">
          <img src={logo} alt="" className="w-full" />
        </div>
        <div className="flex items-center gap-6 text-sm font-medium max-sm:text-xs max-sm:gap-0">
          <div>
            <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg" onClick={handleNewsletter}>
              Newsletter
            </button>
          </div>
          <div>
            <button className="p-2 hover:text-[#1a4735] hover:bg-[#eaeeec] rounded-lg">
              <a href="#contact">Contact Us</a>
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
      </div> */}
      <Nav></Nav>

      <section
        id="started"
        className="flex flex-col gap-3 w-full text-center bg-[#f0f0f0]  text-[#000] "
      >
        <div className=" font-bold text-5xl p-14 px-20 leading-snug max-md:p-1 max-md:text-3xl max-sm:text-lg">
          Introducing Altos Connect <br></br>The Ultimate Solution for Powerful
          & Efficient Whatsapp Marketing!
        </div>
        <div className="max-sm:text-xs">
          Utilize the potential of this widely-used platform to reach your target audience, engage with customers, and drive business growth. With its rich features and global reach, WhatsApp offers an unparalleled opportunity for innovative, effective, and impactful marketing.
        </div>
        <div className="flex gap-16 justify-center text-[#f0f0f0] py-10 max-sm:gap-4">
          {/* <button className="bg-[#2f2e2e] px-5 py-2 rounded-full hover:bg-[#f0f0f0] hover:text-[#2f2e2e] hover:border border border-[#2f2e2e] max-sm:p-2 max-sm:text-xs">
            Try Demo
          </button> */}
          <button className="bg-[#2f2e2e] px-5 py-2 rounded-full hover:bg-[#f0f0f0] hover:text-[#2f2e2e] hover:border border border-[#2f2e2e] max-sm:p-2 max-sm:text-xs">
            {accessToken ? (
              <Link
                to={
                  is_staff
                    ? "/admin/messages"
                    : is_distributor
                      ? "/distributor/users"
                      : "/messages"
                }
              >
                Go to Module
              </Link>
            ) : (
              <Link to="/login">Get Started</Link>
            )}
          </button>
        </div>
      </section>
      {/* <section
        id="video"
        className="flex justify-center items-center gap-7 w-full text-center bg-[#f0f0f0] py-10 max-sm:py-2"
      >
        <iframe
          className="w-10/12 aspect-video"
          src="https://www.youtube.com/embed/GmK43VVcsWc"
          title="How to Send Bulk WhatsApp Messages using the official WhatsApp Cloud APIs"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </section> */}

      <section className="flex flex-col gap-20 w-full text-center px-5 bg-[#f0f0f0] text-[#000] max-sm:gap-5 ">
        <div className=" font-extrabold text-3xl pt-20 px-20 leading-snug max-sm:pt-3">
          Why Altos Connect?
        </div>
        <div className="flex gap-32 justify-center px-28 max-sm:gap-3 max-sm:px-4 max-md:gap-6 max-md:px-6 max-md:flex-col">
          <div className="flex-1 overflow-hidden rounded-2xl transition-shadow ">
            <img
              className="w-full aspect-video hover:shadow-2xl object-cover h-full"
              src="https://img.freepik.com/free-vector/businessmen-shaking-hands-through-display-video-call-smart-phone-internet-business-concept-cartoon-character-vector-illustration_1150-56245.jpg"
              alt=""
            />
          </div>
          <div className="flex-1 text-start flex flex-col gap-4 max-sm:text-xs">
            <div className="text-lg font-extrabold">
              Broadcasting and Retargeting
            </div>
            <div>
              Amplify your reach through powerful broadcasting capabilities.
              With Altos Connect, you can broadcast messages to multiple
              recipients and retarget your audience strategically for enhanced
              engagement.
            </div>
            <div className="text-lg font-extrabold">
              Import Contacts from CSV or TXT
            </div>
            <div>
              Simplify your contact management by importing contacts seamlessly
              from CSV or TXT files, ensuring accuracy and efficiency.
            </div>
          </div>
        </div>
        <div className="flex gap-32 justify-center px-28 max-sm:gap-3 max-sm:px-4 max-md:gap-6 max-md:px-6 max-md:flex-col-reverse">
          <div className="flex-1 text-start flex flex-col gap-4 max-sm:text-xs">
            <div className="text-lg font-extrabold">
              Attach Files, Images, or High- Resolution Videos
            </div>
            <div>
              Enrich your communication with multimedia content. Alt Whatsapp
              allows you to attach files, images, or high-resolution videos,
              making your messages more engaging and impactful.
            </div>
            <div className="text-lg font-extrabold">Button Message Sending</div>
            <div>
              Drive user interaction with button message sending. Create clear
              calls-to-action that prompt immediate responses
              from your audience.
            </div>
          </div>
          <div className="flex-1  overflow-hidden rounded-2xl hover:shadow-2xl transition-shadow ">
            <img
              className="w-full aspect-video object-cover h-full"
              src="https://img.freepik.com/free-vector/businessmen-shaking-hands-through-display-video-call-smart-phone-internet-business-concept-cartoon-character-vector-illustration_1150-56245.jpg"
              alt=""
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-3 w-full text-center bg-[#f0f0f0]  text-[#000] ">
        <h2 className=" font-bold text-5xl p-10 px-20 leading-snug max-md:p-7 max-md:text-3xl max-sm:text-lg">
          Ready to take your WhatsApp marketing to the next level?
        </h2>
        <div className="max-w-xl max-sm:text-xs px-3 pb-5">
          Unleash the potential of Altos Connect and transform the way you
          connect with your audience! Elevate your marketing game with unlimited
          age logins, smart audience segmentation, and powerful broadcasting
          features. Boost engagement, streamline communication, and conquer your
          goals effortlessly.
        </div>
      </section>
      <section
        id="pricing"
        className="flex flex-col justify-center items-center gap-7 w-full text-center bg-[#afd5be] py-10 px-28 max-sm:px-4"
      >
        <h2 className=" font-bold text-5xl p-5 px-20 leading-snug  text-[#221231] max-md:p-1 max-md:text-3xl max-sm:text-lg">
          Plan and Pricing
        </h2>
        <div className="flex justify-center w-full gap-4 max-sm:text-xs max-sm:gap-4 flex-wrap flex-1">
          <div className="bg-white p-4 px-16 flex flex-col items-center justify-between gap-3 rounded-xl pt-16 plan-box w-[300px] ">
            <ul className="flex items-center flex-col whitespace-nowrap gap-4  text-xs ">
              <span className="plan-icon text-center text-9xl text-[#205846] transition-all">
                <FaPaperPlane />
              </span>
              <div className=" text-2xl font-bold mt-5 whitespace-nowrap ">
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
            <Link
              to="/plan-and-pricing"
              type="button"
              className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center "
            >
              More Details
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </Link>
          </div>
          <div className="bg-white p-4 px-16 flex flex-col items-center justify-between gap-3 rounded-xl pt-16 plan-box w-[300px]">
            <ul className="flex items-center flex-col whitespace-nowrap gap-4  text-xs">
              <span className="plan-icon text-center text-9xl text-[#205846]">
                <BiSolidPlaneAlt />
              </span>
              <div className=" text-2xl font-bold mt-5 whitespace-nowrap ">
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
            <Link
              to="/plan-and-pricing"
              type="button"
              className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center "
            >
              More Details
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </Link>
          </div>
          <div className="bg-white p-4 px-16 flex flex-col items-center justify-between gap-3 rounded-xl pt-16 plan-box w-[300px]">
            <ul className="flex items-center flex-col whitespace-nowrap gap-2  text-xs">
              <span className="plan-icon text-center text-9xl text-[#205846]">
                <BsRocketTakeoffFill />
              </span>
              <div className=" text-2xl font-bold mt-5 whitespace-nowrap ">
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
            <Link
              to="/plan-and-pricing"
              type="button"
              className="text-white bg-green-600 hover:bg-green-700  focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center "
            >
              More Details
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      <section
        id="contact"
        className="flex flex-col justify-center items-center gap-7 w-full text-center bg-[#afd5be] text-[#f0f0f0] py-10"
      >
        <div className="flex gap-8 ">
          {/* <div className='px-3 py-1  bg-[#282626] cursor-pointer hover:bg-[#f0f0f0] hover:text-[#282626] max-sm:text-xs'>MARKETING</div>
                    <div className='px-3 py-1 bg-[#282626] cursor-pointer hover:bg-[#f0f0f0] hover:text-[#282626] max-sm:text-xs '>MARKETING</div>
                    <div className='px-3 py-1 bg-[#282626] cursor-pointer hover:bg-[#f0f0f0] hover:text-[#282626] max-sm:text-xs '>MARKETING</div>
                    <div className='px-3 py-1 bg-[#282626] cursor-pointer hover:bg-[#f0f0f0] hover:text-[#282626] max-sm:text-xs '>MARKETING</div> */}
        </div>
        <div className="bg-[#fff] text-[#000] p-10 rounded-2xl flex flex-col gap-4 w-7/12 max-sm:w-10/12">
          <div>Talk to Us</div>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-8 flex-wrap">
              <label className="flex flex-col text-left">
                First Name
                <input
                  type="text"
                  className="input-border"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>
              <label className="flex flex-col text-left">
                Last Name
                <input
                  type="text"
                  className="input-border"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
            </div>
            <div className="flex ">
              <label className="flex flex-1 flex-col text-left">
                Email
                <input
                  type="email"
                  className="input-border"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
            <div className="flex gap-8 flex-wrap">
              <label className="flex flex-col text-left w-28">
                Code
                <select
                  type="text"
                  className="input-border"
                  required
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value)}
                >
                  <option hidden >
                    Select Code
                  </option>
                  {options &&
                    options.map((i) => (
                      <option key={i.code} value={i.code}>
                        {i.code}
                        &nbsp;&nbsp;{i.dial_code}
                      </option>
                    ))}
                </select>
              </label>
              <label className="flex flex-col text-left">
                Phone
                <input
                  type="number"
                  className="input-border"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </div>
            <div className="flex gap-8">
              <label className="flex flex-col text-left flex-1">
                Issue Description
                <textarea
                  type="text"
                  className="input-border"
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-[#1a4735] text-white mt-5 rounded-md"
            >
              Submit
            </button>
          </form>
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
                  <button className="bg-facebook py-2 px-4 text-white rounded mt-2 transition-colors duration-300">
                    <span className=" flex gap-5 items-center">
                      <MdOutlineMailOutline className="text-4xl font-semibold" />
                      <a href="mailto:info@altosconnect.com" target="_blank">
                        info@altosconnect.com
                      </a>
                    </span>
                  </button>
                  {/* <button className="bg-twitter py-2 px-4 text-white rounded ml-2 mt-2 transition-colors duration-300">
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

              {/* <div className="md:w-1/3 md:px-4 md:text-center mt-12 lg:mt-0">
                                <h5 className="text-lg text-white font-medium mb-4">Explore our site</h5>
                                <button className="bg-indigo-600 text-white hover:bg-indigo-700 rounded py-2 px-6 md:px-12 transition-colors duration-300">Explore</button>
                            </div> */}
            </div>
          </div>

          {/* <div className="border-t border-solid border-gray-900 mt-4 py-4">
                        <div className="container px-4 mx-auto">

                            <div className="md:flex md:-mx-4 md:items-center">
                                <div className="md:flex-1 md:px-4 text-center md:text-left">
                                    <p className="text-white">&copy; <strong>FWR</strong></p>
                                </div>
                                <div className="md:flex-1 md:px-4 text-center md:text-right">
                                    <a href="#" className="py-2 px-4 text-white inline-block hover:underline">Terms of Service</a>
                                    <a href="#" className="py-2 px-4 text-white inline-block hover:underline">Privacy Policy</a>
                                </div>
                            </div>

                        </div>
                    </div> */}
        </div>
      </section>
    </div>
  );
}

export default Landing;
