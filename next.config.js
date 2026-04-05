/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Disable image optimization for Vercel free tier
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tr.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'www.roblox.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbnails.roblox.com',
      },
      {
        protocol: 'https',
        hostname: 'daruqaexaqirdfdjaruo.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'apis.roblox.com',
      },
    ],
  },
  async headers() {
    return [];
  },
};

module.exports = nextConfig;

