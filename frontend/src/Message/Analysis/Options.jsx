import React, { useEffect, useState } from "react";
import WhatsappModule from "../../WhatsappModule";
import { useLocation } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import Cookies from "js-cookie";

export default function Options() {
  // Access the location object
  const location = useLocation();

  // Parse the query parameters
  const searchParams = new URLSearchParams(location.search);

  // Get the value of the 'tab' query parameter
  const tab = searchParams.get("tab");
  const template_name = searchParams.get("template");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const accessToken = Cookies.get("accessToken");
  const [data, setData] = useState([]);

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + accessToken,
  };
  useEffect(() => {
    getTemplateData();
  }, []);

  async function getTemplateData() {
    try {
      axios.defaults.baseURL = config.baseUrl;

      const response = await axios({
        url: "get_log/message",
        method: "GET",
        params: {
          template_name: template_name,
          // start: start,
          // end: end,
        },
        headers: headers,
      });

      setData(response.data); // Handle success
    } catch (error) {
      console.error("Error fetching data:", error); // Handle error
    }
  }

  return (
    <div className=" w-full bg-[#ECE5DD] flex justify-between h-screen  rounded-2xl overflow-x-auto">
      <div className="h-full">
        <WhatsappModule select={"templateanalytics"} />
      </div>
      <div className="flex-1 p-5">
        <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow-md sm:rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-green-900">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Template Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b  dark:border-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-400">
                          {index}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.template_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.date_sent).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
