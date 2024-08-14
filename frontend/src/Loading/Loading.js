import React from "react";
import loading from "../Icons/loading.png";

function Loading() {
  return (
    <div className=" w-11/12 bg-[#ECE5DD] flex justify-center items-center h-screen  rounded-2xl overflow-x-auto">
      <img className="animate-spin" src={loading}></img>
    </div>
  );
}

export default Loading;
