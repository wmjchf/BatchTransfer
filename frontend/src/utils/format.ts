export const tokenCount = (count: BigInt) => {
  return;
};

// 基于地址生成头像的工具函数
export const generateAvatarFromAddress = (address: string): string => {
  // 从地址中提取颜色信息
  const cleanAddress = address.replace('0x', '');
  
  // 使用地址的前6位作为背景色
  const bgColor = `#${cleanAddress.slice(0, 6)}`;
  
  // 生成对比色作为文字颜色
  const getBrightness = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };
  
  const textColor = getBrightness(bgColor) > 128 ? '#000000' : '#FFFFFF';
  
  // 获取地址的前4位作为显示文本
  const displayText = address.slice(2, 6).toUpperCase();
  
  // 生成SVG格式的头像
  const svg = `
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="${bgColor}"/>
      <text x="20" y="25" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${displayText}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// 格式化地址显示
export const formatAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};
