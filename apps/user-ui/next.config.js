//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');


/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  images: {
    domains: ['plus.unsplash.com', 'images.unsplash.com', 'plus.unsplash.com', 'ik.imagekit.io', 'placehold.co', 'lh3.googleusercontent.com']
  },
  async rewrites() {
    return [
      {
        source: '/auth/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/:path*`,
      },
      {
        source: '/product/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/:path*`,
      },
    ]
  }
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);

