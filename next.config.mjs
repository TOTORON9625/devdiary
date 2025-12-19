/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sql.js']
  },
  // CSS modules以外でのPostCSS処理を無効化
  webpack: (config) => {
    return config;
  },
  // Turbopackを無効化（安定性のため）
  reactStrictMode: true
};

export default nextConfig;
