import React from "react";
import loadingGif from "../assets/loading.gif";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <img src={loadingGif} alt="Loading..." className="h-16 w-16" />
    </div>
  );
}
