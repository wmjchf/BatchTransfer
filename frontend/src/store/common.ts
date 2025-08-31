import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { IUserInfo, login } from "../service/public";
interface ITokenInfo {
  tokenType: "native" | "erc20";
  tokenAddress?: string;
}
type Action = {
  setTokenInfo: (tokenInfo: ITokenInfo) => void;

};

export interface CommonState {
 
  tokenInfo: ITokenInfo | null;
}

export const useCommonStore = create<CommonState & Action>()(
  immer((set, get) => ({
    tokenInfo: null,

    setTokenInfo:  (tokenInfo) => {
        set((state) => {
            state.tokenInfo = tokenInfo;
          });
    },
  }))
);
