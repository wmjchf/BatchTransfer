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
        
        {/* Usage Rules */}
        <div className="mt-6 w-full flex flex-col gap-4 border-[1px] border-solid border-gray-200 rounded-md p-4">
          <div className="flex flex-col gap-3">
            <span className={classNames(myFont.className, "text-xl font-semibold text-gray-800")}>
              Usage Rules
            </span>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <div className="flex flex-col gap-2">
                <span className="font-medium text-gray-700">📋 CSV Format Requirements:</span>
                <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                  <li>Address format: Valid Ethereum address</li>
                  <li>Amount format: Positive number, decimals supported</li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="font-medium text-gray-700">⚡ Transfer Limits:</span>
                <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                  <li>Maximum 500 addresses per batch</li>
                  <li>Ensure sufficient wallet balance</li>
                  <li>ERC20 tokens require prior approval</li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="font-medium text-gray-700">💰 Fee Information:</span>
                <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                  <li>Base fee + per-address fee</li>
                  <li>Failed transfers auto-refunded</li>
                  <li>Fault-tolerant mechanism supported</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                <span className="text-xs text-yellow-800">
                  ⚠️ Please double-check addresses and amounts, transfers cannot be reversed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 h-full pb-6">
        <AddressList></AddressList>
      </div>
    </div>
  );
}

export default Page;
