import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import page1 from "./assets/page1.webp";
import page2 from "./assets/page2.webp";
import page3 from "./assets/page3.webp";
import page4 from "./assets/page4.webp";
import page5 from "./assets/page5.webp";
import page6 from "./assets/page6.webp";
import page7 from "./assets/page7.webp";
import page8 from "./assets/page8.webp";
import page9 from "./assets/page9.webp";
import page10 from "./assets/page10.webp";
import page11 from "./assets/page11.webp";
import page12 from "./assets/page12.webp";
import logo from "../Icons/altoslogo.png";
import pageFlipSound from "./assets/flip.mp3"

import { GrNext, GrPrevious } from "react-icons/gr";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const Flip = () => {


  const accessToken = Cookies.get("accessToken");
  const is_distributor =
    accessToken && jwtDecode(accessToken).user_is_distributor;
  const is_staff = accessToken && jwtDecode(accessToken).user_is_staff;

  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);




  useEffect(() => {
    const audio = new Audio(pageFlipSound);
    audio.load();
  }, [pageFlipSound]);

  function playSound(pageIndex) {
    return new Promise((resolve, reject) => {
      setCurrentPage(pageIndex); // Set current page after sound finishes


      if (pageIndex === 11) {

        setTimeout(() => {
          bookRef.current.pageFlip().flip(0, { x: 48, y: 0 }); // Flip page after sound finishes
        }, 0);
      }
      const audio = new Audio(pageFlipSound);
      audio.play();
      audio.onended = () => {



        resolve(); // Resolve the promise after all actions are completed
      };
      audio.onerror = (error) => {
        reject(error); // Reject the promise if there's an error
      };

    });
  }
  // Play page flip sound
  // const playPageFlipSound = () => {
  //   const audio = new Audio(pageFlipSound);
  //   audio.play();
  // };


  const nextButtonClick = () => {

    bookRef.current.pageFlip().flipNext();
  };

  const prevButtonClick = () => {

    bookRef.current.pageFlip().flipPrev();

  };
  // const handlePageFlip = (pageIndex) => {
  //   setCurrentPage(pageIndex);
  //   

  //   if (pageIndex === 11) {
  //     

  //     setTimeout(() => {
  //       bookRef.current.pageFlip().flip(0, { x: 48, y: 0 });
  //     }, 0);
  //   }
  // };

  // const is1024x1366Resolution = window.innerWidth === 1024 && window.innerHeight === 1366;

  return (
    <div className="overflow-hidden bg-[#afd5be]">
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
      <div className="flex w-screen items-center justify-center my-3 overflow-hidden gap-72 ">
        <button
          className="text-5xl btn-flip transition-transform duration-300  text-white h-24 hover:bg-black hover:bg-opacity-60 hover:scale-110"
          onClick={prevButtonClick}
        >
          <GrPrevious />
        </button>
        <HTMLFlipBook
          showCover={true}
          width={400}
          height={600}
          size="stretch"
          minWidth={250}
          maxWidth={400}
          minHeight={400}
          maxHeight={600}
          maxShadowOpacity={0.5}
          ref={bookRef}
          onFlip={(e) => {
            playSound(e.data)

          }}
          className="flipbook"

        >
          <div className="page">
            <img src={page1} alt="Page 1" />
          </div>
          <div className="page">
            <img src={page2} alt="Page 2" />
          </div>
          <div className="page">
            <img src={page3} alt="Page 3" />
          </div>
          <div className="page">
            <img src={page4} alt="Page 3" />
          </div>
          <div className="page">
            <img src={page5} alt="Page 3" />
          </div>
          <div className="page">
            <img src={page6} alt="Page 3" />
          </div>
          <div className="page">
            <img src={page7} alt="Page 3" />
          </div>
          <div className="page">
            <img src={page8} alt="Page 3" />
          </div>
          <div className="page">
            <img src={page9} alt="Page 3" />
          </div>
          <div className="page">
            <img src={page10} alt="Page 3" />
          </div>
          <div className="page">
            <img src={page11} alt="Page 3" />
          </div>
          <div className="page">
            <img src={page12} alt="Page 3" />
          </div>
        </HTMLFlipBook>


        <button
          className="text-5xl btn-flip transition-transform duration-300  text-white h-24 hover:bg-black hover:bg-opacity-60 hover:scale-110"
          onClick={nextButtonClick}
        >
          <GrNext />
        </button>
      </div>
      <div className="flex justify-center btn-lg mb-2">
        <button
          className="text-5xl transition-transform duration-300  text-white h-24 hover:bg-black hover:bg-opacity-60 hover:scale-110"
          onClick={prevButtonClick}
        >
          <GrPrevious />
        </button>

        <button
          className="text-5xl transition-transform duration-300  text-white h-24 hover:bg-black hover:bg-opacity-60 hover:scale-110"
          onClick={nextButtonClick}
        >
          <GrNext />
        </button>

      </div>
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
    </div>
  );
};

export default Flip;
