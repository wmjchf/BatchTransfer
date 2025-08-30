import { Input } from "@heroui/react";
import classNames from "classnames";
import localFont from "next/font/local";

const myFont = localFont({
  src: [
    {
      path: "../../fonts/Poppins700.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/Poppins500.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
});

export const AddressList = () => {
  return (
    <div className="w-full flex flex-col h-full border-[1px] border-solid border-gray-200 rounded-md p-4"></div>
  );
};
