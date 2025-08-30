import { fetcher } from "../utils/request";

export interface IUserInfo {
  token: string;
  uid: number;
  code: string;
}
export const login = (data: { walletAddress: string }) => {
  return fetcher<IUserInfo>("/public/login/walletLogin", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const getWalletAddressByCode = (params: { code: string }) => {
  return fetcher<{ wallet_address: string }>("/public/user/getAddress", {
    method: "GET",
    params,
  });
};
