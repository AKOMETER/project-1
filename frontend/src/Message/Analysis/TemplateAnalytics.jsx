import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "../../config";
import WhatsappModule from "../../WhatsappModule";
import { jwtDecode } from "jwt-decode";
import "rsuite/dist/rsuite-no-reset.min.css";
import { DateRangePicker, Button, Modal } from "rsuite";
import { TbMailForward } from "react-icons/tb";
import { RiMailUnreadLine } from "react-icons/ri";
import { HiOutlineMailOpen } from "react-icons/hi";
import isAfter from "date-fns/isAfter";
import { Link } from "react-router-dom";

function TemplateAnalytics() {
  const {
    allowedMaxDays,
    allowedDays,
    allowedRange,
    beforeToday,
    afterToday,
    combine,
  } = DateRangePicker;
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading1, setloading1] = useState(false);
  const accessToken = Cookies.get("accessToken");
  const userid = jwtDecode(accessToken).user_id;
  const [analyticsdata, setAnalyticsdata] = useState();
  const [selectedOption, setSelectedOption] = useState("");

  const [value, setValue] = useState([null, null]);
  const [showWarning, setShowWarning] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + accessToken,
  };

  const GetTemplates = () => {
    // const extractedData = data.data.map((template) => ({
    //                 id: template.id,
    //                 name: template.name,
    //             }));
    //             setTemplates(extractedData);

    axios
      .get(`${config.baseUrl}get_templates/lists?user_id=${userid}`, {
        headers: headers,
      })
      .then((response) => {
        const extractedData = response.data.data.map((template) => ({
          id: template.id,
          name: template.name,
        }));

        setTemplates(extractedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    GetTemplates();
  }, []);

  const handleSelectChange = (e) => {
    setSelectedTemplate(e.target.value); // Update selected value
    const selectedText = e.target.options[e.target.selectedIndex].text;
    setSelectedOption(selectedText); // Set selected option text
  };
  const handleDateChange = (newValue) => {
    const [start, end] = newValue || [null, null];
    const maxDays = 20;
    const today = new Date();

    if (
      end &&
      ((end - start) / (1000 * 60 * 60 * 24) > maxDays || end > today)
    ) {
      setShowWarning(true);
      setValue([null, null]);
    } else {
      setShowWarning(false);
      setValue(newValue);
    }
  };
  const sendData = () => {
    if (value[0] && value[1] && selectedTemplate) {
      setloading1(true);
      const startDate = formatDate(value[0]);
      const endDate = formatDate(value[1]);
      const url = `${config.baseUrl}get_templates/analytics?start_date=${startDate}&end_date=${endDate}&template_id=${selectedTemplate}&user_id=${userid}`;

      axios
        .get(url, { headers: headers })
        .then((response) => {
          setloading1(false);
          setAnalyticsdata(response.data);
        })
        .catch((error) => {
          console.error("Error sending data:", error);
          setloading1(false);
        });
    } else {
      alert("Please select a template and date range.");
    }
  };

  return (
    <div className=" w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto">
      <div className="h-full">
        <WhatsappModule select={"templateanalytics"} />
      </div>
      <div className="flex-1 p-5">
        <div className=" text-[#0d291a] text-4xl font-bold select-none">
          Templates Analytics
        </div>
        <div className="flex p-2 flex-wrap">
          <select
            value={selectedTemplate}
            onChange={handleSelectChange}
            className="h-8"
          >
            <option value="">Select a name</option>
            {templates &&
              templates.map((item, index) => (
                <option key={index} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
          <DateRangePicker
            placeholder="Select Date Range"
            showOneCalendar
            onChange={handleDateChange}
            shouldDisableDate={(date) => isAfter(date, new Date())}
            format="dd.MM.yyyy"
            cleanable
          />
          <button
            className=" bg-[#0d291a] text-white px-2  rounded-lg cursor-pointer select-none "
            onClick={sendData}
          >
            {" "}
            SUBMIT
          </button>
        </div>
        {analyticsdata ? (
          <>
            <div className="flex gap-3 flex-wrap">
              <Link
                to={{
                  pathname: "/template/analytics/options",
                  search: `?tab=sent&template=${selectedOption}&start=${formatDate(
                    value[0]
                  )}&end=${formatDate(value[1])}`,
                }}
              >
                <div className="bg-white p-4 px-16 flex flex-col items-center justify-between gap-3 rounded-xl pt-16 plan-box w-[300px] ">
                  <span className=" text-center text-9xl text-[#205846] transition-all">
                    <TbMailForward />
                  </span>
                  <div>Messages Sent : {analyticsdata.total_sent}</div>
                </div>
              </Link>
              <Link>
                <div className="bg-white p-4 px-16 flex flex-col items-center justify-between gap-3 rounded-xl pt-16 plan-box w-[300px] ">
                  <span className=" text-center text-9xl text-[#205846] transition-all">
                    <RiMailUnreadLine />
                  </span>
                  <div>
                    Messages Delivered : {analyticsdata.total_delivered}
                  </div>
                </div>
              </Link>
              <Link>
                <div className="bg-white p-4 px-16 flex flex-col items-center justify-between gap-3 rounded-xl pt-16 plan-box w-[300px] ">
                  <span className=" text-center text-9xl text-[#205846] transition-all">
                    <HiOutlineMailOpen />
                  </span>
                  <div>Messages Read : {analyticsdata.total_read}</div>
                </div>
              </Link>
            </div>
          </>
        ) : (
          <div>Select a template and dates to get analytics</div>
        )}
      </div>
      <Modal open={showWarning} onHide={() => setShowWarning(false)}>
        <Modal.Header>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The selected date range exceeds the maximum allowed 20 days.
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowWarning(false)} appearance="primary">
            Ok
          </Button>
        </Modal.Footer>
      </Modal>

      {loading1 && (
        <div className=" absolute w-full h-full top-0 left-0 flex justify-center z-20 items-center bg-black/40">
          <svg
            className="animate-spin"
            width="100px"
            height="100px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z"
                fill="#ffffff"
              />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}

export default TemplateAnalytics;
