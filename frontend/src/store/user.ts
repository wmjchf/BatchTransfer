import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { IUserInfo, login } from "../service/public";

type Action = {
  handleLogin: (walletAddress: string) => void;
};

export interface UserState {
  userInfo: IUserInfo | null;
}

export const useUserStore = create<UserState & Action>()(
  immer((set, get) => ({
    userInfo: null,

    handleLogin: async (walletAddress) => {
      const result = await login({ walletAddress });
      if (result.code === 200) {
        const userInfo = result.data;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        set((state) => {
          state.userInfo = userInfo;
        });
      }
    },
  }))
);
