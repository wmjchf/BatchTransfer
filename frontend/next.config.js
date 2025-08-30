/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: `${process.env.NEXT_PUBLIC_BASE_URL}/:path*`,
  //     },
  //   ];
  // },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    domains: ["nextui.org"],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
