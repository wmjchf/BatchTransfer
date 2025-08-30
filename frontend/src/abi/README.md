# NTYE ABI Hooks

这个目录包含了与NTYE智能合约交互的React hooks。

## useMintByNFT

`useMintByNFT` 是一个用于通过NFT进行铸造的React hook。

### 使用方法

```typescript
import { useMintByNFT } from '../abi/ntye';

const MyComponent = () => {
  const { handleMintByNFT, isPending, isError } = useMintByNFT();

  const handleMint = async () => {
    try {
      const tokenIds = [BigInt(1), BigInt(2)]; // NFT token IDs
      const quantity = BigInt(10); // 铸造数量
      const refAddress = "0x1234..."; // 推荐地址（可选）

      const result = await handleMintByNFT(
        tokenIds,
        quantity,
        refAddress
      );

      console.log("Mint successful:", result);
    } catch (error) {
      console.error("Mint failed:", error);
    }
  };

  // 使用零地址的示例
  const handleMintWithoutRef = async () => {
    try {
      const tokenIds = [BigInt(1)];
      const quantity = BigInt(5);

      // 不传入refAddress，会自动使用零地址
      const result = await handleMintByNFT(
        tokenIds,
        quantity
      );

      console.log("Mint successful:", result);
    } catch (error) {
      console.error("Mint failed:", error);
    }
  };

  return (
    <div>
      <button onClick={handleMint} disabled={isPending}>
        {isPending ? "Minting..." : "Mint"}
      </button>
      {isError && <p>Mint failed</p>}
    </div>
  );
};
```

### 参数说明

- `tokenIds: bigint[]` - NFT token ID数组
- `quantity: bigint` - 要铸造的代币数量
- `refAddress?: string` - 推荐地址（可选，如果不提供则使用零地址 `0x0000000000000000000000000000000000000000`）
- `value?: bigint` - 发送的ETH数量（可选，会自动计算）

### 返回值

- `handleMintByNFT` - 铸造函数
- `isPending` - 是否正在处理中
- `isError` - 是否有错误

### 环境变量

确保在 `.env.local` 文件中设置：

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

## 注意事项

1. 确保用户已连接钱包
2. 确保用户有足够的ETH支付gas费用
3. 确保合约地址正确配置
4. 处理错误情况并提供用户反馈 