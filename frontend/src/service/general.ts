import { fetcher } from "../utils/request";

export const getIpInfo = () => {
  return fetcher<{ isAllow: number }>("/general/lib/getIpInfo", {
    method: "GET",
  });
};

export const getTokenIds = (walletAddress: string) => {
  return fetcher<any>("/general/lib/getTokenId", {
    method: "POST",
    body: JSON.stringify({ walletAddress }),
    headers: {
      "content-type": "application/json",
    },
  });
};
