/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 't95mijovmqtxlazb.public.blob.vercel-storage.com',
      },
    ],
  },
  // Hot Module Replacement'i daha güvenli çalıştırma
  webpack: (config, { dev, isServer }) => {
    // Sadece geliştirme modunda ve tarayıcı tarafında ise
    if (dev && !isServer) {
      // HMR iyileştirmeleri
      config.optimization.runtimeChunk = 'single';
    }
    return config;
  },
};

export default nextConfig;
