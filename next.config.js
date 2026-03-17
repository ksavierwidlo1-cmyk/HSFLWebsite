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
        hostname: 'hhyqkflwqlfzjvswarty.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'apis.roblox.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-scripts.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https: *.roblox.com *.rbxcdn.com *.supabase.co cdn.discordapp.com;
              font-src 'self' data:;
              connect-src 'self' https://*.supabase.co https://apis.roblox.com wss://*.supabase.co;
              frame-src 'self' https://www.youtube.com https://player.twitch.tv https://player.vimeo.com;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

