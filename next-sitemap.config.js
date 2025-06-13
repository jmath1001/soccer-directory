/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://soccerfieldrental.net',
  generateRobotsTxt: true,
  outDir: './public',
  exclude: ['/my-fields', '/rental-field-manage', '/add-field', '/add-league', '/login', '/submit-field', '/add-pickup-game', '/register'],
}
