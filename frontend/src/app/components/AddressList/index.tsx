"use client";
import { Button, Card, CardBody, Input, Tab, Tabs } from "@heroui/react";
import classNames from "classnames";
import localFont from "next/font/local";
import Image from "next/image";
import { CSV } from "./CSV";
import { Upload } from "./Upload";
import { Manual } from "./Manual";
import { useState } from "react";

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
  const [selectedTab, setSelectedTab] = useState("csv");
 
  return (
    <div className={classNames("w-full flex flex-col h-full border-[1px] border-solid border-gray-200 rounded-md p-4 relative")}>
      <Tabs aria-label="Options" selectedKey={selectedTab} onSelectionChange={(e)=>{
        setSelectedTab(e as string)
      }}>
        <Tab key="csv" title="CSV Import" className="flex-1">
          <Upload />
        </Tab>
        <Tab key="input" title="Manual Input" className="flex-1">
          <Manual />
        </Tab>
      </Tabs>
      
    </div>
  );
};
