/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://soccer-directory.vercel.app',
  generateRobotsTxt: true,
  outDir: './public',
  exclude: ['/my-fields', '/rental-field-manage', '/add-field', '/add-league', '/login', '/submit-field', '/add-pickup-game', '/register'],
}
