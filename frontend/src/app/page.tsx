import Image from "next/image";
import localFont from "next/font/local";
import classNames from "classnames";
import { TokenSetup } from "./components/TokenSetup";
import { AddressList } from "./components/AddressList";

const myFont = localFont({
  src: [
    {
      path: "./fonts/Poppins700.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Poppins500.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
});

async function Page() {
  return (
    <div className="flex pt-20 max-w-[1200px] mx-auto h-screen gap-6">
      <div className="w-[500px] flex-shrink-0">
        <TokenSetup></TokenSetup>
      </div>
      <div className="flex-1 h-full pb-6">
        <AddressList></AddressList>
      </div>
    </div>
  );
}

export default Page;
