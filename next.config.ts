/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Tells Next.js to build static HTML files
  output: 'export',
  
  // 2. Disables Next.js server-side image optimization (required for static exports)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;