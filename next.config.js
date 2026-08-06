/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.1.98"],
  images: {
    qualities: [75, 90],
  },
};

module.exports = nextConfig;
