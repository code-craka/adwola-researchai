let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js and canvas issues in server-side builds
    if (isServer) {
      // Add canvas to serverless function externals
      config.externals = [...config.externals, 'canvas']
      
      // Handle problematic modules that may use browser APIs
      const problematicModules = ['pdfjs-dist', 'canvas']
      
      problematicModules.forEach((moduleName) => {
        config.module.rules.push({
          test: new RegExp(`node_modules/${moduleName}/.*`),
          use: 'null-loader',
        })
      })
    }
    
    // Copy the PDF.js worker to the public directory
    if (!isServer) {
      config.resolve.alias['pdfjs-dist/build/pdf.worker.entry'] = 
        'pdfjs-dist/legacy/build/pdf.worker.entry'
    }
    
    return config
  },
  reactStrictMode: true,
  // Removed swcMinify as it's no longer recognized in newer Next.js versions
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
