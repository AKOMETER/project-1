import React, { useEffect, useState } from "react";
import "../App.css";
import axios from "axios";
import whatsapplogo from "../Icons/whatsapp.png";
import whatsappgif from "../Icons/whatsappgif.gif";
import Cookies from "js-cookie";
import config from "../config";
import WhatsappModule from "../WhatsappModule";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsCheckLg } from "react-icons/bs";
import useTemplateApi from "../Context/TemplatesApi";

function Upload() {
  const [excelfile, setexcelfile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadbox, setUploadbox] = useState("excelm");
  const [templateData, setTemplateData] = useState();
  const [componentData, setcomponentData] = useState();
  const [selectedHeaderText, setSelectedHeaderText] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedBodyText, setSelectedBodyText] = useState("");
  const [selectedFooterText, setSelectedFooterText] = useState("");
  const [select, setSelect] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const [successMessageupload, setSuccessMessageUpload] = useState(false);
  const [headerHandle, setHeaderHandle] = useState("");
  const [apiurl1, setApiurl1] = useState();
  const [apiurl2, setApiurl2] = useState();
  const accessToken = Cookies.get("accessToken");
  const userid = jwtDecode(accessToken).user_id;
  const [contact, setContact] = useState(false);
  const [contactpopup, setContactpopup] = useState(false);

  const ft = Cookies.get("ft");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setexcelfile(selectedFile);
    event.target.value = null;
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + accessToken,
  };
  const headers1 = {
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + accessToken,
  };

  useEffect(() => {
    if (excelfile) {
      setFileName(excelfile.name);
    } else {
      setFileName("");
    }
  }, [excelfile]);

  const handleSubmitExcelUpload = async (event) => {
    event.preventDefault();

    if (!excelfile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("excel_file", excelfile);
    formData.append("user_id", userid);

    try {
      const response = await axios.post(
        `${config.baseUrl}upload/data`,
        formData,
        { headers: headers1 }
      );

      setSuccessMessageUpload(true);
      setTimeout(() => {
        setSuccessMessageUpload(false);
      }, 3000);
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };
  const { data, loading } = useTemplateApi();

  useEffect(() => {
    setTemplateData(data.data);
  }, [data]);

  const handleSubmitExcelSent = async (event) => {
    event.preventDefault();

    if (!excelfile) {
      alert("Please select a file to upload.");
      return;
    }
    if (!select) {
      alert("Please Select a Template for Messaging");
    }

    const formData = new FormData();
    formData.append("excel_file", excelfile);
    formData.append("template_name", select);
    formData.append("user_id", userid);
    formData.append("image_link", imageurl);
    setSuccessMessage(true);
    try {
      const response = await axios.post(apiurl1, formData, {
        headers: headers1,
      });
      setTimeout(() => {
        setSuccessMessage(false);
        setContact(true);
      }, 2000);
      // setexcelfile('')

      // setTimeout(() => {
      //     setSuccessMessage(false);
      // }, 3000);

      // setSuccessMessage(false)
    } catch (error) {
      console.error("Error uploading file: ", error);
      setSuccessMessage(false);
    }
  };
  const handleSubmitExcelSentPersonalised = async (event) => {
    event.preventDefault();

    if (!excelfile) {
      alert("Please select a file to upload.");
      return;
    }
    if (!select) {
      alert("Please Select a Template for Messaging");
    }

    const formData = new FormData();
    formData.append("excel_file", excelfile);
    formData.append("template_name", select);
    formData.append("user_id", userid);
    formData.append("image_link", imageurl);
    setSuccessMessage(true);
    try {
      const response = await axios.post(apiurl2, formData, {
        headers: headers1,
      });
      setTimeout(() => {
        setSuccessMessage(false);
        setContact(true);
      }, 2000);
      // setexcelfile(null)
      // setTimeout(() => {
      //     setSuccessMessage(false);
      // }, 3000);

      // setSuccessMessage(false)
    } catch (error) {
      console.error("Error uploading file: ", error);
      setSuccessMessage(false);
    }
  };
  const findFormat = (components) => {
    const selectedComponent = components.find(
      (component) => component.type === "HEADER"
    );
    const format = selectedComponent ? selectedComponent.format : null;
    return format ? format.toLowerCase() : null;
  };
  const handleSelectChange = (event) => {
    const name = event.target.value;
    setSelect(name);
    setSelectedName(name);
    const selectedComponent =
      templateData.components[templateData.names.indexOf(name)];
    setcomponentData(selectedComponent);
    const imageName = templateData.images.find((image) => image[name]);
    if (imageName) {
      setHeaderHandle(imageName[name]);
    } else {
      setHeaderHandle("");
    }
    if (selectedComponent) {
      const header = selectedComponent.find(
        (component) => component.type === "HEADER"
      );
      setSelectedHeaderText(header ? header.text : "");
      const body = selectedComponent.find(
        (component) => component.type === "BODY"
      );
      setSelectedBodyText(body.text);
      const footer = selectedComponent.find(
        (component) => component.type === "FOOTER"
      );
      setSelectedFooterText(footer ? footer.text : "");
      const headerHandle =
        header.example && header.example.header_handle
          ? header.example.header_handle[0]
          : "";
      const headerText =
        header.example && header.example.header_text
          ? header.example.header_text[0]
          : "";

      setApiurl1(
        `${config.baseUrl}upload/sent/images?template_format=${findFormat(
          selectedComponent
        )}`
      );
    } else {
      setSelectedHeaderText("");
    }
  };

  const handleSelectChangePersonalised = (event) => {
    const name = event.target.value;
    setSelect(name);
    setSelectedName(name);
    const selectedComponent =
      templateData.components[templateData.names.indexOf(name)];
    const imageName = templateData.images.find((image) => image[name]);
    if (imageName) {
      setHeaderHandle(imageName[name]);
    } else {
      setHeaderHandle("");
    }
    if (selectedComponent) {
      const header = selectedComponent.find(
        (component) => component.type === "HEADER"
      );
      setSelectedHeaderText(header ? header.text : "");
      const body = selectedComponent.find(
        (component) => component.type === "BODY"
      );
      setSelectedBodyText(body.text);
      const footer = selectedComponent.find(
        (component) => component.type === "FOOTER"
      );
      setSelectedFooterText(footer ? footer.text : "");
      const headerHandle =
        header.example && header.example.header_handle
          ? header.example.header_handle[0]
          : "";
      const headerText =
        header.example && header.example.header_text
          ? header.example.header_text[0]
          : "";

      setApiurl2((prevApiurl1) => {
        if (headerText !== "") {
          return `${config.baseUrl}upload/sent/personalised`;
          // toast.error("This is a personalised message template")
          // alert("this is a personalised template message")
        } else {
          toast.error("This is not a personalised message template");
          // return `${config.baseUrl}sent-messages`;
        }
      });
    } else {
      setSelectedHeaderText("");
    }
  };

  const imageurl = config.imagebaseurl + headerHandle;

  return (
    <div className=" w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto">
      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="h-full">
        <WhatsappModule select={"upload"} />
      </div>
      <div className="p-5 flex-1 h-screen overflow-y-scroll">
        <div className=" text-[#0d291a] text-4xl font-bold">
          Upload Numbers using Excel
        </div>
        <div className=" flex gap-10 mt-4 text-lg max-sm:text-xs max-sm:flex-wrap max-sm:gap-1">
          <div
            className={uploadbox === "excelm" ? "btn-active" : "btn-nonactive"}
            onClick={() => {
              setUploadbox("excelm");
            }}
          >
            Excel Messaging
          </div>
          {/* <div className={uploadbox === "excelu" ? 'btn-active' : 'btn-nonactive'} onClick={() => { setUploadbox("excelu") }}>Excel Data Upload</div> */}
          <div
            className={uploadbox === "excelp" ? "btn-active" : "btn-nonactive"}
            onClick={() => {
              setUploadbox("excelp");
            }}
          >
            Excel Personalised Message Upload
          </div>
        </div>
        {uploadbox === "excelm" && (
          <div className="flex max-md:flex-col-reverse max-lg:flex-col-reverse max-sm:px-2">
            <div className=" flex flex-col px-14 mt-7  max-sm:px-2">
              <div>
                Upload and Sent Messages to the Numbers in Excel Document{" "}
              </div>

              <label
                htmlFor="excel-file"
                className="mt-3 excel-bg-1 bg-white h-36 text-center rounded-xl flex flex-col"
              >
                {" "}
                {excelfile ? fileName : ""}
                <input
                  type="file"
                  id="excel-file"
                  accept=".xlsx"
                  className=" invisible"
                  onChange={handleFileChange}
                />
              </label>

              <div className="px-1 bg-[#064A42] text-white text-xs">
                The excel sheets first column should contain phone numbers
              </div>
              <div
                onClick={handleSubmitExcelSent}
                className="select-none cursor-pointer flex justify-center items-center mt-4 bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold text-xs tracking-widest	"
              >
                <img className="h-6 object-contain" src={whatsapplogo} alt="" />
                &nbsp;Send Message now
              </div>
            </div>
            <div>
              <div>Select Templates</div>
              <select value={selectedName} onChange={handleSelectChange}>
                <option value="">Select a name</option>

                {templateData &&
                  templateData.names.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
              <div className="bg-[#262d31] text-gray-300 rounded-tr-lg  rounded-bl-lg rounded-br-lg mb-4 px-4 py-2 mt-4 w-[300px]">
                <div className="font-bold">
                  {selectedHeaderText && selectedHeaderText}
                </div>
                {componentData && findFormat(componentData) === "document" && (
                  <iframe src={imageurl} title="document" />
                )}

                {componentData && findFormat(componentData) === "image" && (
                  <img src={imageurl} alt="Image" />
                )}
                {componentData && findFormat(componentData) === "video" && (
                  <video controls>
                    <source src={imageurl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                <div className="text-[10px]">
                  {selectedBodyText && selectedBodyText}
                </div>
                <div className="font-thin text-xs">
                  {selectedFooterText && selectedFooterText}
                </div>
              </div>
            </div>
          </div>
        )}
        {
          uploadbox === "excelu" && null
          // <div>
          //     <div className=' flex flex-col px-14 mt-7 max-w-max  max-sm:px-2'>
          //         <div>Upload Numbers to List</div>

          //         <label htmlFor="excel-file" className='mt-3 excel-bg-1 bg-white h-36 text-center rounded-xl flex flex-col'>{excelfile ? fileName : ""}
          //             <input type="file" id="excel-file" accept='.xlsx' className=' invisible' onChange={handleFileChange} />
          //         </label>
          //         <div className='px-1 bg-[#064A42] text-white text-xs'>The excel sheets first column should contain phone numbers</div>

          //         <div onClick={handleSubmitExcelUpload} className='select-none cursor-pointer flex justify-center items-center mt-4 bg-[#064A42] max-w-max text-white py-2 px-2 rounded-lg uppercase font-bold text-xs tracking-widest '>
          //             {/* <img className='h-6 object-contain' src={whatsapplogo} alt="" /> */}
          //             &nbsp;Upload Numbers
          //         </div>
          //     </div>
          // </div>
        }
        {uploadbox === "excelp" && (
          <div className="flex max-lg:flex-col-reverse max-sm:px-2 ">
            <div className=" flex flex-col px-14 mt-7 max-w-max max-sm:px-2">
              <div>
                Upload and Sent Personalised Messages to the Numbers in Excel
                Document{" "}
              </div>
              <label
                htmlFor="excel-file"
                className="mt-3 excel-bg-1 bg-white h-36 text-center rounded-xl flex flex-col"
              >
                {" "}
                {excelfile ? fileName : ""}
                <input
                  type="file"
                  id="excel-file"
                  accept=".xlsx"
                  className=" invisible"
                  onChange={handleFileChange}
                />
              </label>
              <div className="px-1 bg-[#064A42] text-white text-xs">
                The excel sheets first column should contain Numbers and second
                column should be Names
              </div>
              <div
                onClick={handleSubmitExcelSentPersonalised}
                className="select-none cursor-pointer flex justify-center items-center mt-4 bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold text-xs tracking-widest	"
              >
                <img className="h-6 object-contain" src={whatsapplogo} alt="" />
                &nbsp;Send Message
              </div>
            </div>
            <div>
              <div>Select Templates</div>
              <select
                value={selectedName}
                onChange={handleSelectChangePersonalised}
              >
                <option value="">Select a name</option>

                {templateData &&
                  templateData.names.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
              <div className="bg-[#262d31] text-gray-300 rounded-tr-lg  rounded-bl-lg rounded-br-lg mb-4 px-4 py-2 mt-4 w-[300px]">
                <div className="font-bold">
                  {selectedHeaderText && selectedHeaderText}
                </div>
                {headerHandle && <img src={imageurl} alt="" />}
                <div className="text-[10px]">
                  {selectedBodyText && selectedBodyText}
                </div>
                <div className="font-thin text-xs">
                  {selectedFooterText && selectedFooterText}
                </div>
              </div>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="transition-all ease-in duration-1000 absolute w-full h-full bg-green-950/25 top-0 left-0 flex justify-center items-center">
            <div className="w-2/6 bg-white rounded-lg flex flex-col items-center p-7">
              <div>
                <img src={whatsappgif} alt="" className=" w-20" />
              </div>
              <div className=" text-green-800 font-semibold">
                Message has been sent Successfully
              </div>
            </div>
          </div>
        )}
        {successMessageupload && (
          <div className="transition-all ease-in duration-1000 absolute w-full h-full bg-green-950/25 top-0 left-0 flex justify-center items-center">
            <div className="w-2/6 bg-white rounded-lg flex flex-col items-center p-7">
              <div>
                <img src={whatsappgif} alt="" className=" w-20" />
              </div>
              <div className=" text-green-800 font-semibold">
                Numbers have been Uploaded
              </div>
            </div>
          </div>
        )}
        {contact && (
          <div className="transition-all ease-in duration-1000 absolute w-full h-full bg-green-950/25 top-0 left-0 flex justify-center items-center">
            <div className=" bg-white rounded-lg flex flex-col  p-7">
              <div className="text-lg font-semibold whitespace-break-spaces">
                {" "}
                Do you want to save this Excel to an existing Contact Group?
              </div>
              <div className="flex justify-end mt-6">
                <div>
                  <span
                    className="select-none cursor-pointer  mt-4 bg-[#1a786d] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold tracking-widest text-xl"
                    onClick={() => {
                      setContact(false);
                    }}
                  >
                    No
                  </span>
                  <span
                    className="select-none cursor-pointer  mt-4 bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold tracking-widest text-xl ml-4"
                    onClick={() => {
                      setContact(false);
                      setContactpopup(true);
                    }}
                  >
                    Yes
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {contactpopup && (
          <div
            className="transition-all ease-in duration-1000 absolute w-full h-full bg-green-950/25 top-0 left-0 flex justify-center items-center"
            onClick={() => {
              setContactpopup(false);
            }}
          >
            <AddtoexistingContact
              excelfile={excelfile}
              setContactpopup={setContactpopup}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;

function AddtoexistingContact({ excelfile, setContactpopup }) {
  const [contacts, setcontacts] = useState();
  const [selectedcontact, setselectedcontact] = useState();
  const accessToken = Cookies.get("accessToken");
  const userid = jwtDecode(accessToken).user_id;
  const headers1 = {
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + accessToken,
  };
  // const formData = new FormData();
  // formData.append()

  useEffect(() => {
    axios
      .get(`${config.baseUrl}contact-group/`, { headers: headers1 })
      .then((res) => setcontacts(res.data))
      .catch((err) => console.log(err));
  }, []);
  function handleSelectChangeContact(e) {
    setselectedcontact(e.target.value);
  }
  // const formData = new FormData();
  const formData = new FormData();
  formData.append("file", excelfile);
  formData.append("user", userid);

  function Submit() {
    axios
      .put(`${config.baseUrl}contact-group/${selectedcontact}/`, formData, {
        headers: headers1,
      })
      .then((res) => setContactpopup(false))
      .catch((err) => console.log(err));
  }
  return (
    <div
      className=" bg-white rounded-lg flex flex-col  p-7"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="text-lg font-semibold whitespace-break-spaces">
        Add to Existing Contact Group{" "}
      </div>
      <div>Select Contact Group</div>
      <select onChange={handleSelectChangeContact}>
        <option value="">Select a name</option>
        {contacts &&
          contacts.map((contactdata, index) => (
            <option key={index} value={contactdata.id}>
              {contactdata.name}
            </option>
          ))}
      </select>
      <span
        className="select-none cursor-pointer  mt-4 bg-[#064A42] max-w-max text-white py-1 px-2 rounded-lg uppercase font-bold tracking-widest text-base ml-4"
        onClick={Submit}
      >
        Save to Contact group
      </span>
    </div>
  );
}
