/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@autorestock/ui-kit', '@autorestock/ui-user', '@autorestock/shared'],
  env: {
    NEXT_PUBLIC_USER_API_BASE: process.env.NEXT_PUBLIC_USER_API_BASE || 'https://autorestock-user-service-production.up.railway.app',
  },
}

module.exports = nextConfig
