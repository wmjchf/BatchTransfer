import Image from "next/image";
import localFont from "next/font/local";
import classNames from "classnames";

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
  return <div className="bg-white"></div>;
}

export default Page;
