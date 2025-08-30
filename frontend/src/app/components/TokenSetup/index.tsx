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

export const TokenSetup = () => {
  return (
    <div className="w-full flex flex-col gap-6 border-[1px] border-solid border-gray-200 rounded-md p-4">
      <div className="flex flex-col gap-3">
        <span
          className={classNames(myFont.className, "text-2xl font-semibold")}
        >
          Token Setup
        </span>
        <span className={classNames(myFont.className)}>
          Enter the token contract address you want to send
        </span>
      </div>
      <Input placeholder="Enter the token contract address"></Input>
    </div>
  );
};
