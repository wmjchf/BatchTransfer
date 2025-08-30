"use client";

import { useEffect } from "react";
import { getIpInfo } from "../../service/general";
import { useRouter } from "next/navigation";

export const IPRegion = () => {
  const router = useRouter();
  useEffect(() => {
    getIpInfo().then((result) => {
      if (!result.data.isAllow) {
        // router.replace("/restrict");
      }
    });
  }, []);
  return <></>;
};
