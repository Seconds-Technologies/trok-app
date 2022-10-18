//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx');

const isDevelopment = process.env.NODE_ENV !== 'production';
const rewritesConfigLocal = [
	{
		source: '/api/:path*',
		destination: 'http://localhost:3333/api/:path*' // Proxy to Backend
	}
];

const rewritesConfigProd = [
	{
		source: '/api/:path*',
		destination: 'https://trok-api-dev.onrender.com/api/:path*'
	}
];

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
	nx: {
		// Set this to true if you would like to use SVGR
		// See: https://github.com/gregberge/svgr
		svgr: false
	},
	webpack: (config, options) => {
		config.experiments = {
			topLevelAwait: true,
			layers: true
		};
		return config;
	},
	rewrites: async () => {
		return isDevelopment ? rewritesConfigLocal : rewritesConfigProd;
	}
};

module.exports = withNx(nextConfig);
