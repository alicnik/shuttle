/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  publicPath: '/build/',
  serverBuildPath: '.netlify/functions-internal/server.js',
  serverConditions: ['deno', 'worker'],
  serverMainFields: ['main', 'module'],
  serverModuleFormat: 'cjs',
  serverPlatform: 'node',
  serverMinify: false,
  server:
    process.env.NETLIFY || process.env.NETLIFY_LOCAL
      ? './server.js'
      : undefined,
  ignoredRouteFiles: ['**/.*'],
  appDirectory: 'app',
  tailwind: true,
  postcss: true,
  assetsBuildDirectory: 'public/build',
};
