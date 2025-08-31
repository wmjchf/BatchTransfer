import { Avatar, Select, SelectItem } from "@heroui/react";
import { useAccount, useSwitchChain } from "wagmi";
export const SwitchNetwork = () => {
  const { chains, switchChain } = useSwitchChain();
  const { chain } = useAccount();

  const getAvatar = (name?: string) => {
    if (name === "Sepolia") {
      return "image/network/ETH.svg";
    }
    if (name === "BNB Smart Chain Testnet") {
      return "image/network/BNB.svg";
    }
    return;
  };

  return (
    <Select
      className="w-[150px]"
      selectedKeys={chain?.id ? [`${chain?.id}`] : []}
      startContent={
        <Avatar
          alt="Argentina"
          className="w-4 h-4 flex-shrink-0"
          src={getAvatar(chain?.name)}
        />
      }
    >
      {chains.map((network) => (
        <SelectItem
          key={network.id}
          onPress={() => {
            switchChain({
              chainId: network.id,
            });
          }}
          startContent={
            <Avatar
              alt="Argentina"
              className="w-6 h-6"
              src={getAvatar(network.name)}
            />
          }
        >
          {network.name}
        </SelectItem>
      ))}
    </Select>
  );
};
