import classNames from "classnames";
import localFont from "next/font/local";

const myFont = localFont({
  src: [
    {
      path: "../fonts/Poppins700.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Poppins500.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
});

const Page = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="mb-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width=".63em"
          height="1em"
          fill="none"
          className="text-[35px] w-[100px] h-[100px] opacity-85 hover:opacity-100"
          viewBox="0 0 115 182"
        >
          <path
            fill="#F0CDC2"
            stroke="#1616B4"
            d="M57.505 181v-45.16L1.641 103.171z"
          ></path>
          <path
            fill="#C9B3F5"
            stroke="#1616B4"
            d="M57.69 181v-45.16l55.865-32.669z"
          ></path>
          <path
            fill="#88AAF1"
            stroke="#1616B4"
            d="M57.506 124.615V66.979L1 92.28z"
          ></path>
          <path
            fill="#C9B3F5"
            stroke="#1616B4"
            d="M57.69 124.615V66.979l56.506 25.302z"
          ></path>
          <path
            fill="#F0CDC2"
            stroke="#1616B4"
            d="M1 92.281 57.505 1v65.979z"
          ></path>
          <path
            fill="#B8FAF6"
            stroke="#1616B4"
            d="M114.196 92.281 57.691 1v65.979z"
          ></path>
        </svg>
      </div>
      <div
        className={classNames(
          "flex flex-col justify-center items-center",
          myFont.className
        )}
      >
        <span>
          Service Unavailable in Your Region Due to regional regulatory
          requirements.
        </span>
        <span>We are unable to provide service for your region.</span>
        <span>Please access from another location or check your settings.</span>
      </div>
    </div>
  );
};
export default Page;
