/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["169.254.81.24"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
