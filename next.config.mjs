/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // CSS modül işleme optimizasyonları
  optimizeCss: true,
  // Istemci tarafı derleme iyileştirmeleri
  swcMinify: true,
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
