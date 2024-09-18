import React from "react";
import WhatsappModule from "../../WhatsappModule";
import { useLocation } from "react-router-dom";

export default function Options() {
  // Access the location object
  const location = useLocation();

  // Parse the query parameters
  const searchParams = new URLSearchParams(location.search);

  // Get the value of the 'tab' query parameter
  const tab = searchParams.get("tab");

  const data = [
    { id: 1, name: "John Doe", date: "12/09/90", number: "+092242423423" },
    { id: 2, name: "Jane Doe", date: "10/09/10", number: "+09382903323" },
    { id: 3, name: "Sam Smith", date: "09/9/90", number: "+23442342322" },
  ];

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
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        List of Number {tab}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr
                        key={item.id}
                        className="bg-white border-b  dark:border-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.number}
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
